import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function connectSocket(token: string): Socket {
	if (!socketInstance) {
		socketInstance = io(String(import.meta.env.VITE_BACKEND_BASE_URL), {
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
