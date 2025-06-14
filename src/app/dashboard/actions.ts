'use server'

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/app/utils/supabase/server"

export async function fetchUsername() {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()
    console.log(user)
    return user?.email ?? null
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/dashboard', 'layout')
    redirect('/login')
}