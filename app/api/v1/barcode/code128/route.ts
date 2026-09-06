import { createApiRoute } from "@/lib/api/route";
import { CAPABILITIES } from "@/lib/api/registry";

export const POST = createApiRoute(CAPABILITIES["barcode.code128"]);
