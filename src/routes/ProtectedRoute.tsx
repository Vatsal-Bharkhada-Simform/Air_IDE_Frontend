import { useGetUserQuery } from "@/store/api/api";
import { Navigate, Outlet } from "react-router";

export function ProtectedRoute() {
	const { data, isLoading } = useGetUserQuery();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (data?.success) {
		return <Outlet />;
	}

	return <Navigate to={"/auth/login"} replace />;
}
