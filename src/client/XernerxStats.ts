/** @format */

import { XernerxClient, XernerxShardClient } from '@xernerx/framework';

import { BaseClient, BaseClientOptions } from './BaseClient.js';
import { post } from '../functions/post.js';
import { terminal } from '@xernerx/terminal';

const t = terminal.child({ scope: 'XS' });

export interface XernerxStatsSettings extends BaseClientOptions {
	interval?: number;
	token: string;
}

export class XernerxStats extends BaseClient {
	public readonly settings: XernerxStatsSettings;

	constructor(client: XernerxShardClient | XernerxClient, settings: XernerxStatsSettings = { interval: 30 * 60000, token: '' }) {
		super(settings.token, { url: settings.url, dev: settings.dev });

		if ((client as XernerxClient).sharded) throw new Error(`Cannot post stats from a sharded client, move this to the main client.`);

		this.settings = settings;

		this.update(client);
	}

	private async update(client: XernerxShardClient | XernerxClient | any) {
		const collector = setInterval(async () => {
			if (!client.stats) return;
			if (!client.stats.shards) client.stats.shards = [];

			if (client.stats.shards.length == (client as XernerxShardClient).totalClusters || (client as XernerxShardClient).totalClusters == undefined) {
				if (client.stats.guildCount === null) return;

				const id = (client as XernerxClient)?.user?.id || (await client.fetchClientValues?.('user.id')?.catch(() => []))?.[0];
				if (!id) return;

				clearInterval(collector);

				await post({ id, ...client.stats }, this.token, this.url)
					.then(() => t.log(`Successfully posted stats.`))
					.catch((err) => t.error(err?.message || String(err)));

				setInterval(
					async () => {
						await post({ id, ...client.stats }, this.token, this.url)
							.then(() => t.log(`Successfully posted stats.`))
							.catch((err) => t.error(err?.message || String(err)));
					},
					this.settings.interval || 30 * 60000
				);
			}
		}, 5000);
	}
}
