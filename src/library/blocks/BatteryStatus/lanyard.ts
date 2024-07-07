const CONSTANTS = {
	WEBSOCKET_URL: "wss://api.lanyard.rest/socket",
	HEARTBEAT_PERIOD: 30000,
	DISCORD_USER_ID: "406665840088317962",
};

type LanyardData = {
	kv: {
		battery: string;
	};
};

export type KVBattery = {
	percentage: number;
	isCharging: boolean;
};

export function lanyard(onPresenceUpdate: (data: LanyardData) => void) {
	const socket = new WebSocket(CONSTANTS.WEBSOCKET_URL);
	const subscribe_to_id = CONSTANTS.DISCORD_USER_ID;

	socket.addEventListener("open", () => {
		socket.send(JSON.stringify({ op: 2, d: { subscribe_to_id } }));

		setInterval(() => {
			socket.send(JSON.stringify({ op: 3 }));
		}, CONSTANTS.HEARTBEAT_PERIOD);
	});

	socket.addEventListener("message", ({ data }) => {
		const { t, d } = JSON.parse(data);

		if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
			onPresenceUpdate(d as LanyardData);
		}
	});

	return socket;
}
