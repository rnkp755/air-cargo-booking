import type { Metadata } from "next"
import RoutesPageClient from "./RoutesPageClient"

export const metadata: Metadata = {
  title: "Search Routes - AirCargo Pro",
  description: "Find the best air cargo routes for your shipment. Search direct flights and transit options.",
}

export default function RoutesPage() {
  return <RoutesPageClient />
}
