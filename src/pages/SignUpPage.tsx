import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useSignupUserMutation } from "../store/api/api";
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

const signupSchema = z.object({
	username: z
		.string()
		.min(3, { message: "Username must be at least 3 characters" }),
	email: z.email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

export function SignUpPage() {
	const navigate = useNavigate();
	const dispatch = useApiDispatch();
	const [signupUser, { isLoading }] = useSignupUserMutation();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof signupSchema>>({
		resolver: zodResolver(signupSchema),
	});

	async function onSubmit(values: z.infer<typeof signupSchema>) {
		try {
			setServerError(null);
			const response = await signupUser(values).unwrap();
			if (response.success) {
				dispatch(setToken(response.data.token));
				navigate("/");
			}
		} catch (error: any) {
			setServerError(
				error.data?.message || "An error occurred during sign up"
			);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
			<Card className="w-full max-w-md shadow-lg border-zinc-200 dark:border-zinc-800">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold tracking-tight text-center">
						Create an account
					</CardTitle>
					<CardDescription className="text-center">
						Enter your details below to create your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								type="text"
								placeholder="johndoe"
								{...register("username")}
							/>
							{errors.username && (
								<p className="text-sm font-medium text-destructive">
									{errors.username.message}
								</p>
							)}
						</div>
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
							<Label htmlFor="password">Password</Label>
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
									Creating account...
								</>
							) : (
								"Sign up"
							)}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
					<div className="text-sm text-center text-muted-foreground">
						Already have an account?{" "}
						<Link
							to="/auth/login"
							className="text-primary hover:underline font-medium"
						>
							Log in
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
