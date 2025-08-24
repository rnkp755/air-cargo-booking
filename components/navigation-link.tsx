"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationLinkProps {
	href: string;
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
}

export function NavigationLink({
	href,
	children,
	className,
	onClick,
	...props
}: NavigationLinkProps) {
	const [isNavigating, setIsNavigating] = useState(false);
	const router = useRouter();

	const handleClick = async (e: React.MouseEvent) => {
		e.preventDefault();

		if (isNavigating) return;

		setIsNavigating(true);

		// Call the onClick callback if provided
		if (onClick) {
			onClick();
		}

		// Add a small delay to ensure the loading state is visible
		setTimeout(() => {
			router.push(href);
		}, 100);
	};

	return (
		<a
			href={href}
			onClick={handleClick}
			className={cn(
				className,
				isNavigating && "opacity-75 pointer-events-none"
			)}
			{...props}
		>
			{isNavigating ? (
				<div className="flex items-center gap-2">
					<Loader2 className="h-3 w-3 animate-spin" />
					<span className="sr-only">Loading...</span>
				</div>
			) : (
				children
			)}
		</a>
	);
}
