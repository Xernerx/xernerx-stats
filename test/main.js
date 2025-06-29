/** @format */

import { ShardingManager } from 'discord.js';
import { XernerxShardStats } from '../dist/main.js';

const manager = new ShardingManager('./test/bot.js', { token: 'MTMxNzgwMTk1MTYzMDcyMTE1NA.GsINrV.ECO8qVzA8cxxj0OBPqoFiUzHj7-SlKcZ-iN7g8', totalShards: 2 });

new XernerxShardStats(manager, { token: 'fDa2w5gHLA3FMny6JjQ3P6544g5B2ELN9hyR6Y81' });

manager.on('shardCreate', async (shard) => {
	console.log(`Shard ${shard.id} launched`);
});

manager.spawn();
