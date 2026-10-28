/** @format */

import { BaseClient, BaseClientOptions } from './BaseClient.js';
import { post, ShardStats, StatsPayload } from '../functions/post.js';

/**
 * Configuration options for initializing a standalone {@link StatsClient}.
 */
export interface StatsClientOptions extends BaseClientOptions {
	/** Discord application / bot ID whose statistics are managed. */
	botId: string;
	/** Xernerx Suite API bearer token. */
	token: string;
}

/**
 * Historical bot telemetry record returned by `GET /v1/bots/:id/stats`.
 */
export interface StatRecord {
	/** Unique MongoDB document identifier for this telemetry snapshot. */
	_id: string;
	/** Discord bot ID. */
	id: string;
	/** Total number of guilds the bot is in. */
	guildCount: number;
	/** Total number of shards running for the bot. */
	shardCount: number;
	/** Total cached or approximate user count across all guilds. */
	userCount: number;
	/** Total vote count recorded for the bot at the time of the snapshot. */
	voteCount: number;
	/** Unix timestamp (ms) when the bot process came online. */
	onlineSince?: number;
	/** Optional per-shard telemetry breakdown. */
	shards?: ShardStats[];
	/** ISO-8601 timestamp when the telemetry entry was recorded. */
	timestamp: string;
}

/**
 * Standalone REST client for reading, posting, updating, and deleting bot telemetry on the Xernerx Suite API.
 */
export class StatsClient extends BaseClient {
	/** Default Discord bot ID targeted by this client. */
	public readonly botId: string;

	/**
	 * Creates a new {@link StatsClient} instance.
	 * @param options - Bot ID, API token, and optional base URL configuration.
	 */
	constructor(options: StatsClientOptions) {
		super(options.token, { url: options.url, dev: options.dev });
		this.botId = options.botId;
	}

	private getEndpoint(botId = this.botId, statId?: string): string {
		const base = `${this.url}/v1/bots/${encodeURIComponent(botId)}/stats`;
		return statId ? `${base}?statId=${encodeURIComponent(statId)}` : base;
	}

	/**
	 * Fetches historical telemetry records for a bot from `GET /v1/bots/:id/stats`.
	 * @param botId - Optional bot ID override (defaults to `this.botId`).
	 * @returns A promise resolving to an array of {@link StatRecord} entries.
	 */
	public async get(botId = this.botId): Promise<StatRecord[]> {
		const response = await fetch(this.getEndpoint(botId), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});

		const body: any = await response.json().catch(() => null);

		if (!response.ok) {
			throw new Error(body?.error || body?.message || `Failed to fetch stats (HTTP ${response.status})`);
		}

		return body as StatRecord[];
	}

	/**
	 * Posts a new telemetry snapshot for a bot to `POST /v1/bots/:id/stats`.
	 * @param data - Telemetry payload (`guildCount`, `userCount`, `shardCount`, `shards`, etc.).
	 * @param botId - Optional bot ID override (defaults to `this.botId`).
	 * @returns A promise resolving to the API response body.
	 */
	public async post(data: Omit<StatsPayload, 'id'>, botId = this.botId) {
		return post({ id: botId, ...data }, this.token, this.url);
	}

	/**
	 * Updates an existing telemetry snapshot or the latest snapshot via `PATCH /v1/bots/:id/stats`.
	 * @param statIdOrData - Either a specific `statId` string or the partial telemetry payload to apply to the latest entry.
	 * @param data - Partial telemetry payload when `statIdOrData` is a `statId` string.
	 * @param botId - Optional bot ID override (defaults to `this.botId`).
	 * @returns A promise resolving to the updated telemetry record.
	 */
	public async update(statIdOrData: string | Partial<Omit<StatsPayload, 'id'>>, data?: Partial<Omit<StatsPayload, 'id'>>, botId = this.botId) {
		const isStatId = typeof statIdOrData === 'string';
		const statId = isStatId ? statIdOrData : undefined;
		const payload = isStatId ? data || {} : statIdOrData;

		const response = await fetch(this.getEndpoint(botId, statId), {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.token}`,
			},
			body: JSON.stringify(payload),
		});

		const body: any = await response.json().catch(() => null);

		if (!response.ok) {
			throw new Error(body?.error || body?.message || `Failed to update stats (HTTP ${response.status})`);
		}

		return body;
	}

	/**
	 * Deletes a specific telemetry entry (or all telemetry entries if `statId` is omitted) via `DELETE /v1/bots/:id/stats`.
	 * @param statId - Optional telemetry snapshot `_id` to delete.
	 * @param botId - Optional bot ID override (defaults to `this.botId`).
	 * @returns A promise resolving to the deletion result.
	 */
	public async delete(statId?: string, botId = this.botId) {
		const response = await fetch(this.getEndpoint(botId, statId), {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});

		const body: any = await response.json().catch(() => null);

		if (!response.ok) {
			throw new Error(body?.error || body?.message || `Failed to delete stats (HTTP ${response.status})`);
		}

		return body;
	}
}
