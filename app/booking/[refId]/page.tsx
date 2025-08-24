import type { Metadata } from "next";
import BookingDetailPageClient from "./BookingDetailPageClient";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ refId: string }>;
}): Promise<Metadata> {
	const { refId } = await params;
	return {
		title: `Booking ${refId} - AirCargo Pro`,
		description:
			"View detailed information and tracking timeline for your air cargo booking.",
	};
}

export default function BookingDetailPage() {
	return <BookingDetailPageClient />;
}
