import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const bucketName = "case-files";

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const caseId = String(formData.get("caseId") ?? "");
  const kind = String(formData.get("kind") ?? "attachment");

  if (!(file instanceof File) || !caseId) {
    return NextResponse.json({ error: "File and caseId are required." }, { status: 400 });
  }

  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

  if (!bucketExists) {
    await supabaseAdmin.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760,
    });
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "";
  const path = `${sanitizeSegment(caseId)}/${Date.now()}-${sanitizeSegment(kind)}${extension ? `.${sanitizeSegment(extension)}` : ""}`;

  const { error } = await supabaseAdmin.storage.from(bucketName).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(path);

  return NextResponse.json({
    ok: true,
    fileName: file.name,
    path,
    publicUrl: data.publicUrl,
  });
}
