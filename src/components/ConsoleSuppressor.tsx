"use client";

import { useEffect } from "react";

/**
 * Suppresses console.log output in all environments.
 * console.warn and console.error are preserved so real issues stay visible.
 *
 * In production builds, Next.js compiler.removeConsole already strips
 * console.log at build time — this component acts as a runtime safety net
 * for any logs that slip through (e.g. from third-party libs or dev mode).
 */
export default function ConsoleSuppressor() {
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		console.log = () => {};
	}, []);

	return null;
}
