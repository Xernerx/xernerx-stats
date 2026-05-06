/** @format */

export async function post(
	data: {
		id?: string;
		onlineSince: number;
		guildCount: number;
		userCount: number;
		shardCount: number | 'auto';
		voteCount: number;
		shards: [] | [{ shardId: string; onlineSince: number; userCount: number; guildCount: number }];
	},
	token: string
) {
	const id = data.id;

	delete data.id;

	const response = fetch(`https://app.xernerx.com/api/v1/bots/${id}/stats`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.catch((error) => console.error('Error:', error.message));

	return await response;
}
