/** @format */

import { Collection, Guild, Shard, ShardingManager } from 'discord.js';
import BaseClient from './BaseClient.js';
import { post } from '../functions/post.js';

export class XernerxShardStats extends BaseClient {
	declare public readyAt: Date;

	constructor(manager: ShardingManager, settings: { token: string; interval: number }) {
		if (typeof settings.token !== 'string') throw new Error(`Token must be of type string, received ${typeof settings.token}.`);

		super(settings.token as string);

		manager.on('shardCreate', async (shard) => {
			shard.on('ready', async () => {
				(shard as unknown as { readyAt: Date }).readyAt = new Date();

				const collector = setInterval(async () => {
					if (manager.shards.size === manager.totalShards) {
						this.readyAt = new Date();

						await new Promise((resolve) => setTimeout(resolve, (manager.totalShards as number) * 5000));

						manager.emit('ready', shard);

						clearInterval(collector);
					}
				}, 1000);
			});
		});

		manager.once('ready' as any, async (shard) => {
			post((await this.getStats(manager, shard as Shard & { readyAt: Date })) as any, this.token);

			setInterval(async () => {
				post((await this.getStats(manager, shard as Shard & { readyAt: Date })) as any, this.token);
			}, settings.interval || 60000);
		});
	}

	private async getStats(manager: ShardingManager, shard: Shard & { readyAt: Date }) {
		const shards = await Promise.all(
			manager.shards.map(async (shard) => ({
				shardId: shard.id,
				onlineSince: Number((shard as unknown as { readyAt: Date }).readyAt),
				guildCount: (await shard.fetchClientValue('guilds.cache.size')) as number,
				userCount: ((await shard.fetchClientValue('guilds.cache')) as Collection<string, Guild>).map((guild: Guild) => guild.memberCount || 0).reduce((a, b) => (a += b), 0),
			}))
		);

		const response = {
			id: (await shard.fetchClientValue('user.id')) as unknown as string,
			onlineSince: Number(this.readyAt),
			timestamp: Number(new Date()),
			guildCount: shards.map((shard) => shard.guildCount).reduce((a, b) => (a += b), 0),
			userCount: shards.map((shard) => shard.userCount).reduce((a, b) => (a += b), 0),
			shardCount: manager.totalShards as number,
			voteCount: 0,
			shards,
		};

		return response;
	}
}
