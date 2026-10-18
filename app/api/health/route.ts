import { handleHealth } from "@/lib/server/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return handleHealth();
}
