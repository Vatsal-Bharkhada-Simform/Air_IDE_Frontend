import { LoadingScreen } from "@/components/ui/loading-screen";
import { useGetUserQuery } from "@/store/api/api";
import { Navigate, Outlet, useLocation } from "react-router";

export function ProtectedRoute() {
	const location = useLocation();
	const { data, isLoading } = useGetUserQuery();

	if (isLoading) {
		return <LoadingScreen />;
	}

	if (!data?.success) {
		return <Navigate to="/auth/login" state={{ from: location }} replace />;
	}

	return <Outlet />;
}
