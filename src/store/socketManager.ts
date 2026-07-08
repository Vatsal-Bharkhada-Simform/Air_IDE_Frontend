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

export function getSocket(): Socket {
	if (!socketInstance) {
		throw new Error("Socket connection has not been established yet.");
	}

	return socketInstance;
}

export function disconnectSocket(): void {
	socketInstance?.disconnect();
	socketInstance = null;
}
