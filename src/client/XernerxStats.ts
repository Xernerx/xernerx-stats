/** @format */

import { Client } from 'discord.js';
import BaseClient from './BaseClient.js';
import { post } from '../functions/post.js';

export class XernerxStats extends BaseClient {
	declare private readyAt: Date;

	constructor(client: Client, settings: { token: string; interval: number }) {
		if (typeof settings.token !== 'string') throw new Error(`Token must be of type string, received ${typeof settings.token}.`);

		super(settings.token as string);

		client.on('ready', (client) => {
			this.readyAt = new Date();

			if (client.shard) throw new Error('XernerxStats cannot be used with sharded Discord clients.');

			post(this.getStats(client), this.token);

			setInterval(() => {
				post(this.getStats(client), this.token);
			}, settings.interval || 60000);
		});
	}
	private getStats(client: Client) {
		const guilds = client.guilds.cache;

		return {
			id: client.user?.id as string,
			onlineSince: Number(this.readyAt),
			timestamp: Number(new Date()),
			guildCount: guilds.size,
			userCount: guilds.map((guild) => guild.memberCount).reduce((a, b) => a + b),
			shardCount: !client.shard ? 0 : 0,
			voteCount: 0,
			shards: [] as [],
		};
	}
}
