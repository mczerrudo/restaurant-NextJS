import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DRF = process.env.DRF_URL!;

export async function GET() {
  // first await cookies()
  const cookieStore = await cookies();
  const access = cookieStore.get("access")?.value;

  const res = await fetch(`${DRF}/owner/restaurants/`, {
    headers: {
      Accept: "application/json",
      Authorization: access ? `Bearer ${access}` : "",
    },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
