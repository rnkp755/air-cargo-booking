import { LoadingSpinner } from "@/components/loading-spinner";

export default function Loading() {
	return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="text-center space-y-4">
				<LoadingSpinner size="lg" />
				<p className="text-muted-foreground">Loading routes...</p>
			</div>
		</div>
	);
}
