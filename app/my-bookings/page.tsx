import type { Metadata } from "next"
import MyBookingsClientPage from "./MyBookingsClientPage"

export const metadata: Metadata = {
  title: "My Bookings - AirCargo Pro",
  description: "View and manage all your air cargo bookings in one place.",
}

export default function MyBookingsPage() {
  return <MyBookingsClientPage />
}
