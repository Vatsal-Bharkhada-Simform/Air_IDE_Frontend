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
	DeleteFileRequest,
	GetFileRequest,
	GetFileResponse,
	GetSessionResponse,
	ListFilesResponse,
	ListParticipantsResponse,
	ListSessionsResponse,
	RenameFileRequest,
	RenameFileResponse,
	UpdateSessionStatusRequest,
	UpdateSessionStatusResponse,
} from "../../types/collabTypes";
import { setToken } from "../slices/authSlice";

export const rootApi = createApi({
	tagTypes: [
		"User",
		"Sessions",
		"MySessions",
		"JoinedSessions",
		"Session",
		"Files",
		"Participants",
	],
	baseQuery: fetchBaseQuery({
		baseUrl: String(import.meta.env.VITE_BACKEND_BASE_URL),
		credentials: "include",
	}),
	endpoints: (builder) => ({
		getUser: builder.query<MeResponseType, void>({
			query: () => "/auth/me",
			providesTags: ["User"],
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
			invalidatesTags: ["User"],
		}),
		signupUser: builder.mutation<SignUpResponseType, SignUpRequestType>({
			query: (userData) => ({
				url: "/auth/signup",
				method: "POST",
				body: userData,
			}),
			invalidatesTags: ["User"],
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
			// Invalidates both split tabs so both refetch after creation
			invalidatesTags: ["MySessions", "JoinedSessions"],
		}),

		// ── Split session list queries (Option B — role param) ────────────
		// Backend today ignores `role`; both return all sessions.
		// When the backend lands role-based filtering, these will automatically
		// return only the relevant subset with no frontend changes needed.

		/** Sessions owned by the current user (role=owner). */
		listMySessions: builder.query<ListSessionsResponse, void>({
			query: () => "/sessions?role=owner",
			providesTags: ["MySessions"],
		}),

		/** Sessions the current user has joined but does not own (role=participant). */
		listJoinedSessions: builder.query<ListSessionsResponse, void>({
			query: () => "/sessions?role=participant",
			providesTags: ["JoinedSessions"],
		}),
		// ─────────────────────────────────────────────────────────────────

		getSession: builder.query<GetSessionResponse, string>({
			query: (inviteCode) => `/sessions/${inviteCode}`,
			providesTags: (_result, _error, inviteCode) => [
				{ type: "Session", id: inviteCode },
			],
		}),

		// ── Session lifecycle mutations (owner only) ──────────────────────

		/** Toggle isActive on a session. Emits session:ended WS event when closing. */
		updateSessionStatus: builder.mutation<
			UpdateSessionStatusResponse,
			UpdateSessionStatusRequest
		>({
			query: ({ id, isActive }) => ({
				url: `/sessions/${id}/status`,
				method: "PATCH",
				body: { isActive },
			}),
			// Refresh both tabs so status badge updates everywhere
			invalidatesTags: (_result, _error, { id }) => [
				"MySessions",
				{ type: "Session", id },
			],
		}),

		/** Hard-delete a session and all its files (cascade). */
		deleteSession: builder.mutation<void, { id: string }>({
			query: ({ id }) => ({
				url: `/sessions/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["MySessions"],
		}),

		/** Participant audit trail — join/leave timestamps. Owner only. */
		listParticipants: builder.query<ListParticipantsResponse, string>({
			query: (sessionId) => `/sessions/${sessionId}/participants`,
			providesTags: (_result, _error, sessionId) => [
				{ type: "Participants", id: sessionId },
			],
		}),
		// ─────────────────────────────────────────────────────────────────

		// ── File mutations ────────────────────────────────────────────────
		createFile: builder.mutation<CreateFileResponse, CreateFileRequest>({
			query: ({ sessionId, ...body }) => ({
				url: `/sessions/${sessionId}/files`,
				method: "POST",
				body,
			}),
			invalidatesTags: (_result, _error, { sessionId }) => [
				{ type: "Files", id: sessionId },
			],
		}),
		listFiles: builder.query<ListFilesResponse, string>({
			query: (sessionId) => `/sessions/${sessionId}/files`,
			providesTags: (_result, _error, sessionId) => [
				{ type: "Files", id: sessionId },
			],
		}),

		/** Get a single file with full content. */
		getFile: builder.query<GetFileResponse, GetFileRequest>({
			query: ({ sessionId, fileId }) =>
				`/sessions/${sessionId}/files/${fileId}`,
			providesTags: (_result, _error, { fileId }) => [
				{ type: "Files", id: fileId },
			],
		}),

		/** Rename a file. Emits file:renamed WS event to all clients. */
		renameFile: builder.mutation<RenameFileResponse, RenameFileRequest>({
			query: ({ sessionId, fileId, newFilename }) => ({
				url: `/sessions/${sessionId}/files/${fileId}/rename`,
				method: "PATCH",
				body: { newFilename },
			}),
			invalidatesTags: (_result, _error, { sessionId }) => [
				{ type: "Files", id: sessionId },
			],
		}),

		/** Delete a file. Emits file:deleted WS event to all clients. */
		deleteFile: builder.mutation<void, DeleteFileRequest>({
			query: ({ sessionId, fileId }) => ({
				url: `/sessions/${sessionId}/files/${fileId}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, { sessionId }) => [
				{ type: "Files", id: sessionId },
			],
		}),
		// ─────────────────────────────────────────────────────────────────
	}),
});

export const {
	useGetUserQuery,
	useLoginUserMutation,
	useSignupUserMutation,
	useLogoutUserQuery,
	useCreateSessionMutation,
	useListMySessionsQuery,
	useListJoinedSessionsQuery,
	useGetSessionQuery,
	useUpdateSessionStatusMutation,
	useDeleteSessionMutation,
	useListParticipantsQuery,
	useCreateFileMutation,
	useListFilesQuery,
	useGetFileQuery,
	useRenameFileMutation,
	useDeleteFileMutation,
} = rootApi;
