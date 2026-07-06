import { createBrowserRouter } from "react-router";
// import App from "@/App";
import { LoginPage } from "@/pages/LoginPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
	{
		path: "/auth",
		children: [
			{
				path: "login",
				Component: LoginPage,
			},
			{
				path: "signup",
				Component: SignUpPage,
			},
		],
	},
	{
		path: "/",
		Component: ProtectedRoute,
		children: [],
	},
]);
