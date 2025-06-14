'use server'

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/app/utils/supabase/server"
import { cookies } from "next/headers"

export async function fetchUsername() {
    const supabase = await createClient()
    const {data: {user}, error} = await supabase.auth.getUser()
    console.log(user)
    return user?.email ?? null
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/dashboard', 'layout')
    redirect('/login')
}

export async function checkCookie() {
    const cookieStore = await cookies()
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) {
        redirect('/login')
    }
}