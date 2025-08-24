import type { Metadata } from "next"
import NewBookingClientPage from "./NewBookingClientPage"

export const metadata: Metadata = {
  title: "New Booking - AirCargo Pro",
  description: "Create a new air cargo booking with detailed shipment information.",
}

export default function NewBookingPage() {
  return <NewBookingClientPage />
}
