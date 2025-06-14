
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSupabaseUser() {
    const cookieStore = await cookies()
    const allCookies = (await cookieStore).getAll()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
            },
        }
    )
    const { data: { user }} = await supabase.auth.getUser()
    return user
}