import { createBrowserRouter } from "react-router";
import { LoginPage } from "@/pages/LoginPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardPage } from "@/pages/DashboardPage";

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
		children: [
			{
				index: true,
				Component: DashboardPage,
			},
		],
	},
]);
