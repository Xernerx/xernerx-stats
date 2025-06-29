/** @format */

export default class BaseClient {
	declare public readonly token: string;

	constructor(token: string) {
		this.token = token;
	}
}
