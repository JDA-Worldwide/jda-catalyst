import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { SANITY_ISR_FALLBACK_TAGS } from "@/sanity/lib/revalidateTags";

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "Missing SANITY_REVALIDATE_SECRET" },
      { status: 500 },
    );
  }

  try {
    const { isValidSignature, body } = await parseBody(request, secret, true);

    if (isValidSignature !== true) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    const revalidated: string[] = [];
    const docType =
      body &&
      typeof body === "object" &&
      "_type" in body &&
      typeof (body as { _type: unknown })._type === "string"
        ? (body as { _type: string })._type
        : null;

    if (docType) {
      revalidateTag(docType, "max");
      revalidated.push(docType);
    } else {
      for (const tag of SANITY_ISR_FALLBACK_TAGS) {
        revalidateTag(tag, "max");
        revalidated.push(tag);
      }
    }

    return NextResponse.json({ revalidated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Revalidation failed" }, { status: 500 });
  }
}
