/** @format */

import { XernerxStats } from '../dist/main.js';
import { Client } from 'discord.js';

const client = new Client({
	intents: [1],
});

// new X.XernerxStats(client, { token: 'fDa2w5gHLA3FMny6JjQ3P6544g5B2ELN9hyR6Y81' });

client.on('ready', (client) => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.login('MTMxNzgwMTk1MTYzMDcyMTE1NA.GsINrV.ECO8qVzA8cxxj0OBPqoFiUzHj7-SlKcZ-iN7g8');
