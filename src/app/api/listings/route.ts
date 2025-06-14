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
    try {
        console.log('Starting GET request for listings...');
        
        const unauthorized = await verify()
        if(unauthorized) {
            console.log('Unauthorized access attempt');
            return unauthorized;
        }
        console.log('Authorization successful');

        console.log('Attempting to connect to MongoDB...');
        try {
            await connectDB()
            console.log('MongoDB connection successful');
        } catch (dbError) {
            console.error('Database connection error:', dbError);
            return NextResponse.json(
                { 
                    errorType: 'DatabaseConnectionError',
                    errorMessage: 'Failed to connect to database',
                    details: dbError instanceof Error ? dbError.message : 'Unknown database error'
                }, 
                { status: 503 }
            );
        }

        console.log('Fetching listings...');
        try {
            const listings = await Listing.find().lean()
            console.log('Listings fetched successfully');
            return NextResponse.json(listings)
        } catch (queryError) {
            console.error('Database query error:', queryError);
            return NextResponse.json(
                { 
                    errorType: 'DatabaseQueryError',
                    errorMessage: 'Failed to fetch listings',
                    details: queryError instanceof Error ? queryError.message : 'Unknown query error'
                }, 
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Detailed error in GET /api/listings:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        
        return NextResponse.json(
            { 
                errorType: error instanceof Error ? error.name : 'Error',
                errorMessage: error instanceof Error ? error.message : 'An unknown error has occurred',
                details: error instanceof Error ? error.stack : undefined
            }, 
            { status: 500 }
        )
    }
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