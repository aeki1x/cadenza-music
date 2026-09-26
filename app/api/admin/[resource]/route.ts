import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, staffOnly } from "@/lib/api";
import { resources, ResourceName } from "@/lib/resources";

function getResource(name: string) {
  if (!(name in resources)) throw new Error("RESOURCE_NOT_FOUND");
  return resources[name as ResourceName];
}

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    await staffOnly();
    const { resource: name } = await context.params;
    const resource = getResource(name);
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const limit = Math.min(Number(url.searchParams.get("limit") || 100), 500);

    const supabase = await createClient();
    let query = supabase.from(resource.table).select(resource.select).limit(limit).order("created_at", { ascending: false });

    if (search && resource.searchable.length) {
      const clauses = resource.searchable.map((field) => `${field}.ilike.%${search}%`).join(",");
      query = query.or(clauses);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return NextResponse.json({ data });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    await staffOnly();
    const { resource: name } = await context.params;
    const resource = getResource(name);
    const body = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase.from(resource.table).insert(body).select(resource.select).single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    await staffOnly();
    const { resource: name } = await context.params;
    const resource = getResource(name);
    const body = await request.json();
    const { id, ...changes } = body;
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

    const supabase = await createClient();
    const { data, error } = await supabase.from(resource.table).update(changes).eq("id", id).select(resource.select).single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ data });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    await staffOnly();
    const { resource: name } = await context.params;
    const resource = getResource(name);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from(resource.table).delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
