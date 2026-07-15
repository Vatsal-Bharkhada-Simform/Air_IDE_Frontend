import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useLoginUserMutation } from "../store/api/api";
import { useApiDispatch } from "../store/store";
import { setToken } from "../store/slices/authSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
	email: z.email({ message: "Invalid email address" }),
	password: z.string().min(1, { message: "Password is required" }),
});

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
	const dispatch = useApiDispatch();
	const [loginUser, { isLoading }] = useLoginUserMutation();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
	});

	async function onSubmit(values: z.infer<typeof loginSchema>) {
		try {
			setServerError(null);
			const response = await loginUser(values).unwrap();
			if (response.success) {
				dispatch(setToken(response.data.token));
				navigate(from, { replace: true });
			}
		} catch (error: any) {
			setServerError(
				error.data?.message || "An error occurred during login"
			);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
			<Card className="w-full max-w-md shadow-lg border-zinc-200 dark:border-zinc-800">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold tracking-tight text-center">
						Welcome back
					</CardTitle>
					<CardDescription className="text-center">
						Enter your email and password to log in to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								{...register("email")}
							/>
							{errors.email && (
								<p className="text-sm font-medium text-destructive">
									{errors.email.message}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
							</div>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								{...register("password")}
							/>
							{errors.password && (
								<p className="text-sm font-medium text-destructive">
									{errors.password.message}
								</p>
							)}
						</div>
						{serverError && (
							<div className="text-sm font-medium text-destructive">
								{serverError}
							</div>
						)}
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Logging in...
								</>
							) : (
								"Log in"
							)}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
					<div className="text-sm text-center text-muted-foreground">
						Don't have an account?{" "}
						<Link
							to="/auth/signup"
							className="text-primary hover:underline font-medium"
						>
							Sign up
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
