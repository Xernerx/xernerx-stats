<!-- @format -->

![Xernerx Banner](https://xernerx.com/banner.png)

# @xernerx/stats

The official **Xernerx Suite Telemetry & Stats SDK** (`@xernerx/stats`) to automatically report, query, update, and manage Discord bot telemetry on `https://api.xernerx.com/v1/bots/:id/stats`.

---

## Features

- **Automatic `@xernerx/framework` Extension (`XernerxStats`)**: Waits until all shards/clusters report their metrics, posts an initial telemetry snapshot, and syncs on a configurable interval (`30` minutes by default).
- **Standalone REST Client (`StatsClient`)**: Full class-based CRUD client (`this.get()`, `this.post()`, `this.update()`, `this.delete()`) for managing telemetry records without requiring `discord.js`.
- **Hybrid Sharding Support**: Automatically aggregates `guildCount`, `userCount`, `shardCount`, and per-shard `ShardStats` breakdowns from `XernerxClient` and `XernerxShardClient`.
- **Direct Helper Function (`post`)**: Lightweight zero-state helper for one-off telemetry submissions in serverless or custom pipelines.
- **Scoped CLI Logging**: Built-in `@xernerx/terminal` integration under the `XS` scope.

---

## Install

```bash
pnpm add @xernerx/stats
```

```bash
npm install @xernerx/stats
```

---

## Setup

Extend `XernerxClient` and register `XernerxStats` via `extensionHandler`:

```ts
import { XernerxClient } from '@xernerx/framework';
import { XernerxStats } from '@xernerx/stats';
import { Terminal } from '@xernerx/terminal';

export class Client extends XernerxClient {
	private readonly logger = new Terminal({ scope: 'XS' });

	constructor() {
		super({
			intents: ['Guilds'],
			token: process.env.DISCORD_BOT_TOKEN!,
		});

		this.modules.extensionHandler.loadExtensions(
			new XernerxStats(this, {
				token: process.env.XERNERX_TOKEN!,
				interval: 30 * 60_000, // Every 30 minutes (default)
			})
		);

		this.connect();
		this.logger.info('Initialized bot client with XernerxStats telemetry.');
	}
}

new Client();
```

---

## Standalone REST Client (`StatsClient`)

Extend `StatsClient` to post, query, update, and delete telemetry records on the Xernerx Suite API:

```ts
import { StatsClient } from '@xernerx/stats';
import { Terminal } from '@xernerx/terminal';

export class Stats extends StatsClient {
	private readonly console = new Terminal({ scope: 'XS' });

	constructor() {
		super({
			botId: 'YOUR_BOT_ID',
			token: process.env.XERNERX_API_TOKEN!,
		});
	}

	async run() {
		// Post a new telemetry snapshot
		await this.post({
			guildCount: 1500,
			shardCount: 2,
			userCount: 450000,
			onlineSince: Date.now(),
		});

		// Fetch historical telemetry snapshots
		const history = await this.get();
		this.console.info(`Fetched ${history.length} telemetry entries.`);

		// Update the latest telemetry entry (or pass a specific statId as the first argument)
		await this.update({ guildCount: 1550 });
		await this.update('STAT_ENTRY_ID', { guildCount: 1550 });

		// Delete a specific telemetry entry (or omit statId to clear history)
		await this.delete('STAT_ENTRY_ID');
	}
}

new Stats().run();
```

---

## Direct Function (`post`)

For custom pipelines, call `post(data, token, baseUrl?)` directly:

```ts
import { post } from '@xernerx/stats';
import { Terminal } from '@xernerx/terminal';

export class TelemetryPoster extends Terminal {
	constructor() {
		super({ scope: 'XS' });
	}

	async run() {
		await post(
			{
				id: 'YOUR_BOT_ID',
				guildCount: 1500,
				userCount: 450000,
				shardCount: 2,
			},
			process.env.XERNERX_API_TOKEN!
		);

		this.info('Posted telemetry snapshot.');
	}
}

new TelemetryPoster().run();
```

---

## Options (`XernerxStatsSettings` & `StatsClientOptions`)

| Option     | Type      | Default                     | Required      | Description                                                                   |
| ---------- | --------- | --------------------------- | ------------- | ----------------------------------------------------------------------------- |
| `token`    | `string`  | —                           | **Yes**       | Xernerx Suite API bearer token (`Bearer <token>`).                            |
| `botId`    | `string`  | —                           | `StatsClient` | Discord bot snowflake ID to manage telemetry for.                             |
| `interval` | `number`  | `1800000` (30m)             | No            | Interval in milliseconds between automatic telemetry posts in `XernerxStats`. |
| `url`      | `string`  | `'https://api.xernerx.com'` | No            | Custom Xernerx Suite API base URL.                                            |
| `dev`      | `boolean` | `false`                     | No            | Connect to the local development API (`http://localhost:4001`).               |

---

## `StatsClient` Methods

| Method                                     | Return Type             | Description                                                                                       |
| ------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------- |
| `this.get(botId?)`                         | `Promise<StatRecord[]>` | Fetches historical telemetry records from `GET /v1/bots/:id/stats`.                               |
| `this.post(data, botId?)`                  | `Promise<any>`          | Posts a new telemetry snapshot (`StatsPayload`) to `POST /v1/bots/:id/stats`.                     |
| `this.update(statIdOrData, data?, botId?)` | `Promise<any>`          | Updates the latest telemetry snapshot or a specific `statId` via `PATCH /v1/bots/:id/stats`.      |
| `this.delete(statId?, botId?)`             | `Promise<any>`          | Deletes a specific `statId` snapshot or clears telemetry history via `DELETE /v1/bots/:id/stats`. |

---

## Documentation & API Reference

Full documentation and interactive API references are available on the **[Xernerx Documentation](https://docs.xernerx.com)** and the **[`@xernerx/stats` Package Reference](https://docs.xernerx.com/packages/@xernerx/stats)**.

### Package Symbols (`@xernerx/stats`)

- **Classes**:
  - [`XernerxStats`](https://docs.xernerx.com/packages/@xernerx/stats#class-XernerxStats) — Automatic telemetry extension for `XernerxClient` and `XernerxShardClient`.
  - [`StatsClient`](https://docs.xernerx.com/packages/@xernerx/stats#class-StatsClient) — Standalone REST client for `GET`, `POST`, `PATCH`, and `DELETE` telemetry operations.
  - [`BaseClient`](https://docs.xernerx.com/packages/@xernerx/stats#class-BaseClient) — Base authenticated HTTP client for the Xernerx Suite API.
- **Interfaces**:
  - [`XernerxStatsSettings`](https://docs.xernerx.com/packages/@xernerx/stats#interface-XernerxStatsSettings) — Configuration options for `XernerxStats`.
  - [`StatsClientOptions`](https://docs.xernerx.com/packages/@xernerx/stats#interface-StatsClientOptions) — Configuration options for `StatsClient`.
  - [`BaseClientOptions`](https://docs.xernerx.com/packages/@xernerx/stats#interface-BaseClientOptions) — Base URL and development mode options.
  - [`StatRecord`](https://docs.xernerx.com/packages/@xernerx/stats#interface-StatRecord) — Historical telemetry snapshot returned by `this.get()`.
  - [`StatsPayload`](https://docs.xernerx.com/packages/@xernerx/stats#interface-StatsPayload) — Telemetry payload structure (`guildCount`, `serverCount`, `userCount`, `shardCount`, `voteCount`, `onlineSince`, `shards`).
  - [`ShardStats`](https://docs.xernerx.com/packages/@xernerx/stats#interface-ShardStats) — Per-shard telemetry breakdown (`shardId`, `onlineSince`, `userCount`, `guildCount`).
- **Functions**:
  - [`post()`](https://docs.xernerx.com/packages/@xernerx/stats#function-post) — Direct `POST /v1/bots/:id/stats` helper function.

### REST API v1 Endpoints

- [API Overview](https://docs.xernerx.com/api/v1#overview)
- [Bearer Token Authentication](https://docs.xernerx.com/api/v1#authentication)
- [Fetch Bot Stats (`GET /v1/bots/:id/stats`)](https://docs.xernerx.com/api/v1#fetch-bot-stats)
- [Post Bot Stats (`POST /v1/bots/:id/stats`)](https://docs.xernerx.com/api/v1#post-bot-stats)
- [Update Bot Stats (`PATCH /v1/bots/:id/stats`)](https://docs.xernerx.com/api/v1#update-bot-stats)
- [Delete Bot Stats (`DELETE /v1/bots/:id/stats`)](https://docs.xernerx.com/api/v1#delete-bot-stats)

### Ecosystem Links

- [Xernerx Documentation Home](https://docs.xernerx.com)
- [All Xernerx Packages](https://docs.xernerx.com/packages)
- [`xernerx` Collection](https://docs.xernerx.com/packages/xernerx)
- [`@xernerx/framework` Documentation](https://docs.xernerx.com/packages/@xernerx/framework)
- [`@xernerx/commands` Documentation](https://docs.xernerx.com/packages/@xernerx/commands)
- [`@xernerx/hooks` Documentation](https://docs.xernerx.com/packages/@xernerx/hooks)
- [`@xernerx/terminal` Documentation](https://docs.xernerx.com/packages/@xernerx/terminal)
- [`@xernerx/websocket` Documentation](https://docs.xernerx.com/packages/@xernerx/websocket)
- [Release Changelog](https://info.xernerx.com/changelog#@xernerx/stats)

---

## Support & Links

- [Discord Support Server](https://xernerx.com/discord)
- [`@xernerx/stats` Package Documentation](https://docs.xernerx.com/packages/@xernerx/stats)
- [Xernerx Developer Portal](https://portal.xernerx.com)
- [Xernerx Website](https://xernerx.com)
