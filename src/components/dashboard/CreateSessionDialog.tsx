import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Zap, Loader2 } from "lucide-react";
import { useCreateSessionMutation } from "@/store/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const createSessionSchema = z.object({
	name: z
		.string()
		.min(1, "Session name is required")
		.max(64, "Name too long"),
});

type CreateSessionForm = z.infer<typeof createSessionSchema>;

interface CreateSessionDialogProps {
	open: boolean;
	onClose: () => void;
}

export function CreateSessionDialog({
	open,
	onClose,
}: CreateSessionDialogProps) {
	const [createSession, { isLoading }] = useCreateSessionMutation();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateSessionForm>({
		resolver: zodResolver(createSessionSchema),
	});

	async function onSubmit(values: CreateSessionForm) {
		try {
			setServerError(null);
			await createSession({ name: values.name }).unwrap();
			reset();
			onClose();
		} catch (err: any) {
			setServerError(err?.data?.message ?? "Failed to create session.");
		}
	}

	function handleClose() {
		reset();
		setServerError(null);
		onClose();
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Zap className="h-5 w-5 text-muted-foreground" />
						Create New Session
					</DialogTitle>
					<DialogDescription>
						Start a new collaborative coding session. You'll get an
						invite code to share with your teammates.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="session-name">Session Name</Label>
						<Input
							id="session-name"
							placeholder="e.g. Backend Refactor Sprint"
							{...register("name")}
						/>
						{errors.name && (
							<p className="text-sm text-destructive">
								{errors.name.message}
							</p>
						)}
					</div>

					{serverError && (
						<p className="text-sm text-destructive">
							{serverError}
						</p>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
							id="create-session-submit"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating…
								</>
							) : (
								"Create Session"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
