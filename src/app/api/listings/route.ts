import { getSupabaseUser } from "@/helper/getUserA";
import { connectDB } from "@/lib/db";
import { Listing } from "@/lib/models/Listing";
import { ListingSchema } from "@/types/listing";
import { NextResponse } from "next/server";

async function verify() {
    const user =  await getSupabaseUser()
    if(!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }
    return null
}
// Get all listings
export async function GET() {
    const unauthorized = await verify()
    if(unauthorized) return unauthorized

    await connectDB()
    const listings = await Listing.find().lean()
    return NextResponse.json(listings)
}

// POST a new Listing
export async function POST(req: Request) {
    const unauthorized = await verify()
    if(unauthorized) return unauthorized

    const body = await req.json()
    const parsed = ListingSchema.safeParse(body)

    if(!parsed.success) { 
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400})
    }

    await connectDB()
    const listing = await Listing.create(parsed.data)
    return NextResponse.json(listing, { status: 201 })
}

export async function DELETE(req: Request) {
    const unauthorized = await verify()
    if(unauthorized) return unauthorized
    
    const body = await req.json() // id
    if(!body.id) return NextResponse.json({error: "Missing ID"}, { status: 400 });

    await connectDB()
    const delListing = await Listing.findByIdAndDelete(body.id)
    if(!delListing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    return NextResponse.json({ success: true, deleted: delListing }, { status: 200 });
}