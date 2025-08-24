"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationButtonProps {
	href: string;
	children: React.ReactNode;
	className?: string;
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
	disabled?: boolean;
}

export function NavigationButton({
	href,
	children,
	className,
	variant = "default",
	size = "default",
	disabled = false,
	...props
}: NavigationButtonProps) {
	const [isNavigating, setIsNavigating] = useState(false);
	const router = useRouter();

	const handleClick = async () => {
		if (disabled || isNavigating) return;

		setIsNavigating(true);

		// Add a small delay to ensure the loading state is visible
		setTimeout(() => {
			router.push(href);
		}, 100);
	};

	return (
		<Button
			onClick={handleClick}
			disabled={disabled || isNavigating}
			variant={variant}
			size={size}
			className={cn(className, isNavigating && "opacity-90")}
			{...props}
		>
			{isNavigating ? (
				<div className="flex items-center gap-2">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>Loading...</span>
				</div>
			) : (
				children
			)}
		</Button>
	);
}
