/** @format */

import { BaseClient, BaseClientOptions } from './client/BaseClient.js';
import { StatsClient, StatsClientOptions, StatRecord } from './client/StatsClient.js';
import { XernerxStats, XernerxStatsSettings } from './client/XernerxStats.js';
import { post, ShardStats, StatsPayload } from './functions/post.js';

export { XernerxStats, StatsClient, BaseClient, post };
export type { XernerxStatsSettings, StatsClientOptions, StatRecord, BaseClientOptions, StatsPayload, ShardStats };
