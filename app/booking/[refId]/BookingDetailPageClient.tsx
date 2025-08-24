"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Loader2,
	AlertCircle,
} from "lucide-react";
import {
	getBookingHistory,
	type BookingHistoryResponse,
} from "@/lib/api";
import BookingInfoPage from "./BookingInfos";

export default function BookingDetailPageClient() {
	const params = useParams();
	const refId = params.refId as string;

	const [booking, setBooking] = useState<BookingHistoryResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (refId) {
			fetchBookingDetails();
		}
	}, [refId]);

	const fetchBookingDetails = async () => {
		try {
			setLoading(true);
			const response = await getBookingHistory(refId);
			setBooking(response);
		} catch (err) {
			setError("Failed to load booking details. Please try again.");
			console.error("Booking fetch error:", err);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
						<p>Loading booking details...</p>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-1 flex items-center justify-center">
					<Alert className="max-w-md">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{error || "Booking not found"}
						</AlertDescription>
					</Alert>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />

			<BookingInfoPage 
				booking={booking} 
				setBooking={setBooking} 
				refId={refId} 
			/>

			<Footer />
		</div>
	);
}
