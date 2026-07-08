import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
	/** JWT for authenticating the socket connection. Populated on login/signup. */
	token: string | null;
}

const initialState: AuthState = {
	token: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setToken(state, action: PayloadAction<string>) {
			state.token = action.payload;
		},
		clearToken(state) {
			state.token = null;
		},
	},
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
