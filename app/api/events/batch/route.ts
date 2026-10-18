import { handleBatchEvent } from "@/lib/server/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handleBatchEvent(req);
}
