import { Loader2 } from "lucide-react";
import {
	useListMySessionsQuery,
	useListJoinedSessionsQuery,
} from "@/store/api/api";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionTable } from "./SessionTable";

interface SessionsTabsProps {
	onCreateClick: () => void;
}

export function SessionsTabs({ onCreateClick }: SessionsTabsProps) {
	const {
		data: myData,
		isLoading: myLoading,
		isError: myError,
	} = useListMySessionsQuery();

	const {
		data: joinedData,
		isLoading: joinedLoading,
		isError: joinedError,
	} = useListJoinedSessionsQuery();

	// The backend filters by role server-side, so data from each endpoint
	// already contains only the relevant sessions.
	const mySessions = myData?.data.sessions ?? [];
	const joinedSessions = joinedData?.data.sessions ?? [];

	if (myLoading || joinedLoading) {
		return (
			<div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
				<Loader2 className="h-5 w-5 animate-spin" />
				<span>Loading sessions…</span>
			</div>
		);
	}

	if (myError || joinedError) {
		return (
			<div className="flex items-center justify-center py-20">
				<p className="text-sm text-destructive">
					Failed to load sessions. Please refresh the page.
				</p>
			</div>
		);
	}

	return (
		<Tabs defaultValue="mine" className="w-full">
			<TabsList className="mb-4">
				<TabsTrigger value="mine" id="tab-my-sessions">
					My Sessions
					{mySessions.length > 0 && (
						<Badge
							variant="secondary"
							className="ml-2 h-5 min-w-5 px-1.5 text-xs"
						>
							{mySessions.length}
						</Badge>
					)}
				</TabsTrigger>
				<TabsTrigger value="joined" id="tab-joined-sessions">
					Joined Sessions
					{joinedSessions.length > 0 && (
						<Badge
							variant="secondary"
							className="ml-2 h-5 min-w-5 px-1.5 text-xs"
						>
							{joinedSessions.length}
						</Badge>
					)}
				</TabsTrigger>
			</TabsList>

			<TabsContent value="mine">
				<SessionTable
					sessions={mySessions}
					isOwner={true}
					onCreateClick={onCreateClick}
					emptyLabel="No sessions yet"
					emptyDescription="Create your first session to start collaborating."
				/>
			</TabsContent>

			<TabsContent value="joined">
				<SessionTable
					sessions={joinedSessions}
					isOwner={false}
					onCreateClick={onCreateClick}
					emptyLabel="No joined sessions"
					emptyDescription="Join a session using an invite code shared by a teammate."
				/>
			</TabsContent>
		</Tabs>
	);
}
