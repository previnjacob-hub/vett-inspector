import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 500 });
  }

  const body = (await request.json()) as {
    email: string;
    password: string;
    name: string;
    role: "admin" | "office" | "verifier" | "advocate";
    title: string;
    sectors: string[];
  };

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Could not create auth user." },
      { status: 400 },
    );
  }

  const { error: profileError } = await supabaseAdmin.from("app_users").upsert({
    id: authUser.user.id,
    email: body.email,
    name: body.name,
    role: body.role,
    title: body.title,
    sectors: body.sectors,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, userId: authUser.user.id });
}
