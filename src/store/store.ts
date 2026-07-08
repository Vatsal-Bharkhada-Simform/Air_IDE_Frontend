import { configureStore } from "@reduxjs/toolkit";
import { rootApi } from "./api/api";
import { useDispatch, useSelector } from "react-redux";
import authReducer from "./slices/authSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		[rootApi.reducerPath]: rootApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(rootApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export const useApiDispatch = useDispatch.withTypes<typeof store.dispatch>();
export const useRootSelector = useSelector.withTypes<RootState>();
