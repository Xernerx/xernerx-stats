/** @format */

/**
 * Telemetry snapshot for a single Discord bot shard or cluster.
 */
export interface ShardStats {
	/** Numeric or string identifier of the shard/cluster. */
	shardId: string | number;
	/** Unix timestamp (ms) when the shard came online. */
	onlineSince: number | null;
	/** Total user count managed by this shard. */
	userCount: number | null;
	/** Total guild count managed by this shard. */
	guildCount: number | null;
}

/**
 * Payload accepted by `POST /v1/bots/:id/stats` when reporting bot telemetry.
 */
export interface StatsPayload {
	/** Discord bot ID (required when calling {@link post} directly). */
	id?: string;
	/** Unix timestamp (ms) when the bot process came online. */
	onlineSince?: number | null;
	/** Total number of guilds the bot is in. */
	guildCount?: number | null;
	/** Alias for `guildCount` supported by the Xernerx API. */
	serverCount?: number | null;
	/** Total number of users across all guilds. */
	userCount?: number | null;
	/** Total number of shards or `'auto'`. */
	shardCount?: number | 'auto' | null;
	/** Optional total vote count override. */
	voteCount?: number | null;
	/** Optional array of per-shard telemetry objects. */
	shards?: ShardStats[] | [];
}

/**
 * Posts a bot telemetry snapshot directly to `POST /v1/bots/:id/stats`.
 * @param data - Telemetry payload containing `id` (bot ID) and guild/user/shard metrics.
 * @param token - Xernerx Suite API bearer token.
 * @param baseUrl - Optional custom API base URL (defaults to `'https://api.xernerx.com'`).
 * @returns A promise resolving to the parsed JSON response from the Xernerx API.
 */
export async function post(data: StatsPayload, token: string, baseUrl = 'https://api.xernerx.com') {
	const { id, ...payload } = data;

	if (!id) {
		throw new Error('Bot ID is required to post stats.');
	}

	const endpoint = `${baseUrl.replace(/\/$/, '')}/v1/bots/${encodeURIComponent(id)}/stats`;

	const response = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify(payload),
	});

	const body: any = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(body?.error || body?.message || `Failed to post stats (HTTP ${response.status})`);
	}

	return body;
}
