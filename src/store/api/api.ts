import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
	LoginRequestType,
	LoginResponseType,
	LogoutResponseType,
	MeResponseType,
	SignUpRequestType,
	SignUpResponseType,
} from "../../types/authTypes";

export const rootApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: String(import.meta.env.VITE_BACKEND_BASE_URL),
		credentials: "include",
	}),
	endpoints: (builder) => ({
		getUser: builder.query<MeResponseType, void>({
			query: () => "/auth/me",
		}),
		logoutUser: builder.query<LogoutResponseType, void>({
			query: () => "/auth/logout",
		}),
		loginUser: builder.mutation<LoginResponseType, LoginRequestType>({
			query: (userData) => ({
				url: "/auth/login",
				method: "POST",
				body: userData,
			}),
		}),
		signupUser: builder.mutation<SignUpResponseType, SignUpRequestType>({
			query: (userData) => ({
				url: "/auth/signup",
				method: "POST",
				body: userData,
			}),
		}),
	}),
});

export const {
	useGetUserQuery,
	useLoginUserMutation,
	useSignupUserMutation,
	useLogoutUserQuery,
} = rootApi;
