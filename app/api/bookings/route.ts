import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema/bookings";
import { events } from "@/db/schema/events";
import { APIResponse } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";

export const GET = asyncHandler(async (req: Request) => {

    const myBookings = await db
        .select()
        .from(bookings)
        .limit(50);
    
    return NextResponse.json(
        new APIResponse(true, "Bookings fetched successfully", myBookings)
    );
});