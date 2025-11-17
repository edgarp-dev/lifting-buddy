import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error signing out:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
    } catch (error) {
        console.error('Error during logout:', error);

        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}