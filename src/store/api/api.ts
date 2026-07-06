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
	}),
	endpoints: (builder) => ({
		getUser: builder.query<MeResponseType, null>({
			query: () => "/auth/me",
		}),
		logoutUser: builder.query<LogoutResponseType, null>({
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
				url: "/auth/login",
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

// Now comes the hardest part. I want you to configure the query slice such that it manages all the socket events mentioned in the files. Use proper types and handle all the socket events gracefully
