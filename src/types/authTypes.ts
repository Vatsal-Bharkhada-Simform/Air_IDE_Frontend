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
		};
		token: string;
	};
};
