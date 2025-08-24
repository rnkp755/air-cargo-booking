import type { Metadata } from "next"
import BookingDetailPageClient from "./BookingDetailPageClient"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Booking ${params.id} - AirCargo Pro`,
    description: "View detailed information and tracking timeline for your air cargo booking.",
  }
}

export default function BookingDetailPage() {
  return <BookingDetailPageClient />
}
