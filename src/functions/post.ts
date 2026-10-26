/** @format */

// Bot shard and telemetry payloads
export interface ShardStats {
	shardId: string | number;
	onlineSince: number | null;
	userCount: number | null;
	guildCount: number | null;
}

export interface StatsPayload {
	id?: string;
	onlineSince?: number | null;
	guildCount?: number | null;
	serverCount?: number | null;
	userCount?: number | null;
	shardCount?: number | 'auto' | null;
	voteCount?: number | null;
	shards?: ShardStats[] | [];
}

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
