import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

/**
 * Derive the socket server URL from the REST base URL.
 * Socket.IO must connect to the server *origin* (no path suffix),
 * because the server only registers the default "/" namespace.
 * e.g. "http://localhost:4000/api" → "http://localhost:4000"
 */
function getSocketUrl(): string {
	const base = String(import.meta.env.VITE_BACKEND_BASE_URL);
	try {
		return new URL(base).origin;
	} catch {
		// Fallback: strip everything from the first path segment
		return base.replace(/\/[^/].*$/, "");
	}
}

export function connectSocket(token: string): Socket {
	if (!socketInstance) {
		socketInstance = io(getSocketUrl(), {
			auth: { token },
			autoConnect: false,
		});
	}

	if (!socketInstance.connected) {
		socketInstance.connect();
	}

	return socketInstance;
}

/**
 * Returns the active socket instance, or null if not yet established.
 * Use this in places that can safely handle the absence of a connection
 * (e.g. useEffect hooks that run before the socket is ready).
 */
export function getSocket(): Socket | null {
	return socketInstance;
}

export function disconnectSocket(): void {
	socketInstance?.disconnect();
	socketInstance = null;
}
