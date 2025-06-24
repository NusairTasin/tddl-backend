import { getSupabaseUser } from "@/helper/getUserA";
import { connectDB } from "@/lib/db";
import { Blog } from "@/lib/models/Blog";
import { Contact } from "@/lib/models/Contact";
import { NextResponse, NextRequest } from "next/server";
import { blogCreateSchema, blogUpdateSchema } from "@/lib/validations/blog";

async function verify() {
    const user =  await getSupabaseUser()
    if(!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }
    return user
}

export async function GET(req: NextRequest) {
    const unauthorized = await verify()
    if (unauthorized instanceof NextResponse) return unauthorized
    try {
        await connectDB()
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1', 10)
        const limit = parseInt(searchParams.get('limit') || '6', 10)
        const skip = (page - 1) * limit
        const [blogs, total] = await Promise.all([
            Blog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Blog.countDocuments()
        ])
        return NextResponse.json({ blogs, total })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const user = await verify()
    if (user instanceof NextResponse) return user
    try {
        await connectDB()
        const body = await req.json()
        const parseResult = blogCreateSchema.safeParse(body)
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 })
        }
        // Use the first contact in the database
        const contact = await Contact.findOne({})
        if (!contact) {
            return NextResponse.json({ error: 'No contact found. Please create a contact first.' }, { status: 400 })
        }
        const newBlog = await Blog.create({
            ...parseResult.data,
            contact: contact._id,
            author: contact.name
        })
        return NextResponse.json({ blog: newBlog }, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    const user = await verify()
    if (user instanceof NextResponse) return user
    try {
        await connectDB()
        const body = await req.json()
        const parseResult = blogUpdateSchema.safeParse(body)
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 })
        }
        // Use the first contact in the database
        const contact = await Contact.findOne({})
        if (!contact) {
            return NextResponse.json({ error: 'No contact found. Please create a contact first.' }, { status: 400 })
        }
        const { id, ...updateData } = parseResult.data
        // Always update author to match contact name
        const updatedBlog = await Blog.findByIdAndUpdate(id, { ...updateData, author: contact.name }, { new: true })
        if (!updatedBlog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
        }
        return NextResponse.json({ blog: updatedBlog })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const unauthorized = await verify()
    if (unauthorized instanceof NextResponse) return unauthorized
    try {
        await connectDB()
        const { id } = await req.json()
        if (!id) {
            return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 })
        }
        const deletedBlog = await Blog.findByIdAndDelete(id)
        if (!deletedBlog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Blog deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}