import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AVATAR_ENGINE_URL =
	"https://avatar-engine.vatsal-bharkhada.workers.dev/avatar";

function getInitials(name: string) {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

interface AvatarImageProps {
	/** The user's avatar seed — obtained from the backend at signup */
	seed: string | null | undefined;
	/** Display name used to generate fallback initials */
	username: string;
	/** Tailwind class for the Avatar wrapper, e.g. "h-6 w-6" */
	className?: string;
	/** Inline style overrides for the fallback element */
	fallbackStyle?: React.CSSProperties;
	/** Extra class names for the AvatarFallback element */
	fallbackClassName?: string;
}

/**
 * Renders a user's SVG avatar fetched from the avatar engine,
 * falling back to an initials-based badge when no seed is available.
 *
 * Usage:
 *   <AvatarImage seed={user.avatarSeed} username={user.username} className="h-6 w-6" />
 */
export function AvatarImage({
	seed,
	username,
	className,
	fallbackStyle,
	fallbackClassName,
}: AvatarImageProps) {
	const src = seed ? `${AVATAR_ENGINE_URL}?seed=${seed}` : null;

	return (
		<Avatar className={className}>
			{src ? (
				<img
					src={src}
					alt={`${username}'s avatar`}
					className="h-full w-full object-cover rounded-full"
				/>
			) : (
				<AvatarFallback
					className={fallbackClassName}
					style={fallbackStyle}
				>
					{getInitials(username)}
				</AvatarFallback>
			)}
		</Avatar>
	);
}
