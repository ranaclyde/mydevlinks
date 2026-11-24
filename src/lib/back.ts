/**
 * `true` solo si se llegó desde el directorio `home` (`/` o `/en`) de este mismo sitio;
 * entonces volver es `history.back()`.
 */
export function shouldGoBack(referrer: string, origin: string, home = '/'): boolean {
	if (!referrer) return false;
	try {
		const url = new URL(referrer);
		return url.origin === origin && url.pathname === home;
	} catch {
		return false;
	}
}
