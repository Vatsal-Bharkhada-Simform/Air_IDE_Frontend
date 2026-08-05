export type LoginRequestType = {
	email: string;
	password: string;
};

export type LoginResponseType = {
	success: boolean;
	message: string;
	data: {
		user: {
			id: string;
			username: string;
			email: string;
			avatarSeed: string | null;
		};
		token: string;
	};
};

export type SignUpRequestType = {
	username: string;
	email: string;
	password: string;
};

export type SignUpResponseType = {
	success: boolean;
	message: string;
	data: {
		user: {
			id: string;
			username: string;
			email: string;
			avatarSeed: string | null;
			createdAt: string;
		};
		token: string;
	};
};

export type LogoutResponseType = {
	success: boolean;
	message: string;
};

export type MeResponseType = {
	success: boolean;
	data: {
		user: {
			id: string;
			email: string;
			username: string;
			avatarSeed: string | null;
		};
		token: string;
	};
};
