import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
	LoginRequestType,
	LoginResponseType,
	LogoutResponseType,
	MeResponseType,
	SignUpRequestType,
	SignUpResponseType,
} from "../../types/authTypes";
import type {
	CreateFileRequest,
	CreateFileResponse,
	CreateSessionRequest,
	CreateSessionResponse,
	GetSessionResponse,
	ListFilesResponse,
	ListSessionsResponse,
} from "../../types/collabTypes";
import { setToken } from "../slices/authSlice";

export const rootApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: String(import.meta.env.VITE_BACKEND_BASE_URL),
		credentials: "include",
	}),
	endpoints: (builder) => ({
		getUser: builder.query<MeResponseType, void>({
			query: () => "/auth/me",
			onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
				const { data } = await queryFulfilled;
				console.log(data);

				if (data.data.token) {
					dispatch(setToken(data.data.token));
				}
			},
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
		createSession: builder.mutation<
			CreateSessionResponse,
			CreateSessionRequest
		>({
			query: (body) => ({
				url: "/sessions",
				method: "POST",
				body,
			}),
		}),
		listSessions: builder.query<ListSessionsResponse, void>({
			query: () => "/sessions",
		}),
		getSession: builder.query<GetSessionResponse, string>({
			query: (inviteCode) => `/sessions/${inviteCode}`,
		}),
		createFile: builder.mutation<CreateFileResponse, CreateFileRequest>({
			query: ({ sessionId, ...body }) => ({
				url: `/sessions/${sessionId}/files`,
				method: "POST",
				body,
			}),
		}),
		listFiles: builder.query<ListFilesResponse, string>({
			query: (sessionId) => `/sessions/${sessionId}/files`,
		}),
	}),
});

export const {
	useGetUserQuery,
	useLoginUserMutation,
	useSignupUserMutation,
	useLogoutUserQuery,
	useCreateSessionMutation,
	useListSessionsQuery,
	useGetSessionQuery,
	useCreateFileMutation,
	useListFilesQuery,
} = rootApi;
