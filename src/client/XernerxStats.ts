/** @format */

import { XernerxClient, XernerxShardClient } from '@xernerx/framework';

import { BaseClient, BaseClientOptions } from './BaseClient.js';
import { post } from '../functions/post.js';
import { terminal } from '@xernerx/terminal';

const t = terminal.child({ scope: 'XS' });

/**
 * Configuration settings for the {@link XernerxStats} auto-sync client.
 */
export interface XernerxStatsSettings extends BaseClientOptions {
	/** Interval in milliseconds between automatic telemetry posts (defaults to `1800000` / 30 minutes). */
	interval?: number;
	/** Xernerx Suite API bearer token. */
	token: string;
}

/**
 * Automatic telemetry reporter for `@xernerx/framework` (`XernerxClient` or `XernerxShardClient`).
 *
 * Waits for all shards/clusters to report ready statistics, posts an initial snapshot to the Xernerx Suite API,
 * and schedules periodic updates at `settings.interval`.
 */
export class XernerxStats extends BaseClient {
	/** Resolved settings for telemetry posting and interval scheduling. */
	public readonly settings: XernerxStatsSettings;

	/**
	 * Attaches automatic telemetry reporting to a `XernerxClient` or `XernerxShardClient`.
	 * @param client - Standalone `XernerxClient` or primary `XernerxShardClient` manager.
	 * @param settings - API token, posting interval, and optional API base URL settings.
	 */
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
