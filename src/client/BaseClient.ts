/** @format */

/**
 * Base configuration options for Xernerx API clients.
 */
export interface BaseClientOptions {
	/** Optional custom Xernerx API base URL (defaults to `https://api.xernerx.com`). */
	url?: string;
	/** When `true`, connects to the local development API (`http://localhost:4001`). */
	dev?: boolean;
}

/**
 * Base REST client holding the resolved Xernerx API URL and bearer token.
 */
export class BaseClient {
	/** Xernerx API bearer token used for `Authorization` headers. */
	public readonly token: string;
	/** Resolved Xernerx API base URL without a trailing slash. */
	public readonly url: string;

	/**
	 * Creates a new {@link BaseClient} instance.
	 * @param token - Xernerx API bearer token.
	 * @param options - Optional environment and endpoint overrides.
	 */
	constructor(token: string, options: BaseClientOptions = {}) {
		this.token = token;
		const envUrl =
			typeof process !== 'undefined' && process.env?.API_URL
				? process.env.API_URL
				: typeof process !== 'undefined' && process.env?.ENVIRONMENT?.toUpperCase() === 'CANARY'
					? 'https://api.canary.xernerx.com'
					: 'https://api.xernerx.com';
		this.url = (options.url ?? (options.dev ? 'http://localhost:4001' : envUrl)).replace(/\/$/, '');
	}
}
