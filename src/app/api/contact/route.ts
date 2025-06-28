import { getSupabaseUser } from "@/helper/getUserA";
import { connectDB } from "@/lib/db";
import { Contact } from "@/lib/models/Contact";
import { NextResponse, NextRequest } from "next/server";
import { contactCreateSchema, contactUpdateSchema } from "@/lib/validations/contact";

async function verify() {
    const user =  await getSupabaseUser()
    if(!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }
    return null
}

export async function GET() {
    const unauthorized = await verify()
    if (unauthorized) return unauthorized
    try {
        await connectDB()
        const contacts = await Contact.find().sort({ createdAt: -1 }).lean()
        return NextResponse.json({ contacts })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    const unauthorized = await verify()
    if (unauthorized) return unauthorized
    try {
        await connectDB()
        const body = await req.json()
        const parseResult = contactUpdateSchema.safeParse(body)
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 })
        }
        const { id, ...updateData } = parseResult.data
        const updatedContact = await Contact.findByIdAndUpdate(id, updateData, { new: true })
        if (!updatedContact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
        }
        return NextResponse.json({ contact: updatedContact })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const unauthorized = await verify()
    if (unauthorized) return unauthorized
    try {
        await connectDB()
        const { id } = await req.json()
        if (!id) {
            return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 })
        }
        const deletedContact = await Contact.findByIdAndDelete(id)
        if (!deletedContact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Contact deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const unauthorized = await verify()
    if (unauthorized) return unauthorized
    try {
        await connectDB()
        const user = await getSupabaseUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const body = await req.json()
        const parseResult = contactCreateSchema.safeParse(body)
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 })
        }
        // Check if a contact already exists for this user (by email)
        const existingContact = await Contact.findOne({ email: parseResult.data.email })
        if (existingContact) {
            return NextResponse.json({ error: 'Contact already exists for this user' }, { status: 400 })
        }
        const newContact = await Contact.create(parseResult.data)
        return NextResponse.json({ contact: newContact }, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}