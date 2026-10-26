/** @format */

import { BaseClient, BaseClientOptions } from './BaseClient.js';
import { post, ShardStats, StatsPayload } from '../functions/post.js';

export interface StatsClientOptions extends BaseClientOptions {
	botId: string;
	token: string;
}

export interface StatRecord {
	_id: string;
	id: string;
	guildCount: number;
	shardCount: number;
	userCount: number;
	voteCount: number;
	onlineSince?: number;
	shards?: ShardStats[];
	timestamp: string;
}

export class StatsClient extends BaseClient {
	public readonly botId: string;

	constructor(options: StatsClientOptions) {
		super(options.token, { url: options.url, dev: options.dev });
		this.botId = options.botId;
	}

	private getEndpoint(botId = this.botId, statId?: string): string {
		const base = `${this.url}/v1/bots/${encodeURIComponent(botId)}/stats`;
		return statId ? `${base}?statId=${encodeURIComponent(statId)}` : base;
	}

	public async getStats(botId = this.botId): Promise<StatRecord[]> {
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

	public async postStats(data: Omit<StatsPayload, 'id'>, botId = this.botId) {
		return post({ id: botId, ...data }, this.token, this.url);
	}

	public async updateStats(statIdOrData: string | Partial<Omit<StatsPayload, 'id'>>, data?: Partial<Omit<StatsPayload, 'id'>>, botId = this.botId) {
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

	public async deleteStats(statId?: string, botId = this.botId) {
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
