/** @format */

import { Client, XernerxClient, XernerxShardClient } from 'xernerx';
import BaseClient from './BaseClient.js';
import { post } from '../functions/post.js';

export class XernerxStats extends BaseClient {
	declare public readonly settings;

	constructor(client: Client | XernerxShardClient | XernerxClient, settings: { interval?: number; token: string } = { interval: 30 * 60000, token: '' }) {
		super(settings.token);

		if ((client as XernerxClient).sharded) throw new Error(`Cannot post stats from a sharded client, move this to the main client.`);

		this.settings = settings;

		this.#update(client);
	}

	async #update(client: XernerxShardClient | XernerxClient | any) {
		const collector = setInterval(async () => {
			if (!client.stats.shards) client.stats.shards = [];

			if (client.stats.shards.length == (client as XernerxShardClient).totalClusters || (client as XernerxShardClient).totalClusters == undefined) {
				const id = (client as XernerxClient)?.user?.id || (await client.fetchClientValues('user.id'))[0];

				await post({ id, ...client.stats }, this.token).catch(console.error);

				setInterval(
					async () => {
						await post({ id, ...client.stats }, this.token).catch(console.error);
					},
					this.settings.interval || 30 * 60000
				);

				clearInterval(collector);
			}
		}, 5000);
	}
}
