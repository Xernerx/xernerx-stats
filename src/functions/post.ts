/** @format */

export async function post(
	data: {
		id: string;
		onlineSince: number;
		guildCount: number;
		userCount: number;
		shardCount: number | 'auto';
		voteCount: number;
		shards: [] | [{ shardId: string; onlineSince: number; userCount: number; guildCount: number }];
	},
	token: string
) {
	const response = fetch('https://app.xernerx.com/stats/bots', {
		method: 'POST',
		headers: { Authorization: token },
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.catch((error) => console.error('Error:', error));

	return await response;
}
