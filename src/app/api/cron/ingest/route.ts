import { NextResponse } from "next/server";
import { getShutdownNotices } from "@/lib/shutdowns/cache";
import { notifyUsersForNotices } from "@/lib/push/notify";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { notices, health } = await getShutdownNotices({ force: true });
  const notify = await notifyUsersForNotices(notices.filter((n) => n.status !== "past"));

  return NextResponse.json({
    ok: true,
    health,
    notify,
  });
}

export async function POST(request: Request) {
  return GET(request);
}
