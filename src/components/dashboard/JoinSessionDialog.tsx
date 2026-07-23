import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LogIn, Loader2 } from "lucide-react";
import { useGetSessionQuery } from "@/store/api/api";
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

const joinSessionSchema = z.object({
	inviteCode: z.string().min(1, "Invite code is required"),
});

type JoinSessionForm = z.infer<typeof joinSessionSchema>;

interface JoinSessionDialogProps {
	open: boolean;
	onClose: () => void;
}

export function JoinSessionDialog({ open, onClose }: JoinSessionDialogProps) {
	const navigate = useNavigate();
	const [inviteCode, setInviteCode] = useState<string | null>(null);
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		data: sessionData,
		isLoading: isFetching,
		isError,
	} = useGetSessionQuery(inviteCode ?? "", { skip: !inviteCode });

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<JoinSessionForm>({
		resolver: zodResolver(joinSessionSchema),
	});

	useEffect(() => {
		if (sessionData?.success && inviteCode) {
			navigate(`/session/${inviteCode}`);
		}
	}, [sessionData, inviteCode, navigate]);

	useEffect(() => {
		if (isError && inviteCode) {
			setServerError(
				"Session not found. Check the invite code and try again."
			);
			setInviteCode(null);
		}
	}, [isError, inviteCode]);

	async function onSubmit(values: JoinSessionForm) {
		setServerError(null);
		setInviteCode(values.inviteCode.trim());
	}

	function handleClose() {
		reset();
		setServerError(null);
		setInviteCode(null);
		onClose();
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<LogIn className="h-5 w-5 text-signal-blue" />
						Join a Session
					</DialogTitle>
					<DialogDescription>
						Enter the invite code shared by your teammate to join
						their session.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="invite-code">Invite Code</Label>
						<Input
							id="invite-code"
							placeholder="e.g. ABC123"
							className="font-mono tracking-widest uppercase"
							{...register("inviteCode")}
						/>
						{errors.inviteCode && (
							<p className="text-sm text-destructive">
								{errors.inviteCode.message}
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
							disabled={isFetching}
							id="join-session-submit"
						>
							{isFetching ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Joining…
								</>
							) : (
								"Join Session"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
