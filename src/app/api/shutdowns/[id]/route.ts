import { NextResponse } from "next/server";
import { getNoticeById, getShutdownNotices } from "@/lib/shutdowns/cache";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);

  // Ensure cache warmed
  await getShutdownNotices();
  const notice = getNoticeById(decoded);

  if (!notice) {
    return NextResponse.json({ error: "Notice not found" }, { status: 404 });
  }

  return NextResponse.json({ notice });
}
