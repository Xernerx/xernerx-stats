<!-- @format -->

# @xernerx/stats

Xernerx Stats is the official SDK to upload and manage Discord bot telemetry on `https://api.xernerx.com/v1/bots/:id/stats`.

## Usage with `@xernerx/framework`

```ts
import { XernerxStats } from '@xernerx/stats';

new XernerxStats(client, {
	token: process.env.XERNERX_TOKEN!,
	interval: 30 * 60_000,
});
```

## Standalone API Client (`StatsClient`)

```ts
import { StatsClient } from '@xernerx/stats';

const stats = new StatsClient({
	botId: 'YOUR_BOT_ID',
	token: process.env.XERNERX_API_TOKEN!,
});

// Post stats
await stats.postStats({
	serverCount: 1500,
	shardCount: 2,
	userCount: 450000,
});

// Fetch stats
const currentStats = await stats.getStats();

// Update a stat entry
await stats.updateStats('STAT_ENTRY_ID', { serverCount: 1550 });

// Delete a stat entry
await stats.deleteStats('STAT_ENTRY_ID');
```
