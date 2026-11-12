/** `true` solo si se llegó desde el directorio de este mismo sitio; entonces volver es `history.back()`. */
export function shouldGoBack(referrer: string, origin: string): boolean {
	if (!referrer) return false;
	try {
		const url = new URL(referrer);
		return url.origin === origin && url.pathname === '/';
	} catch {
		return false;
	}
}
