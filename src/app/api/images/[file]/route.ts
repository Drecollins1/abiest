import { imageBucket, imageIdFrom } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const id = imageIdFrom((await params).file);
  if (!id) return new Response("Not found", { status: 404 });

  const bucket = await imageBucket();
  const [doc] = await bucket.find({ _id: id }).limit(1).toArray();
  if (!doc) return new Response("Not found", { status: 404 });

  const chunks: Buffer[] = [];
  for await (const chunk of bucket.openDownloadStream(id)) chunks.push(chunk as Buffer);

  return new Response(new Uint8Array(Buffer.concat(chunks)), {
    headers: {
      "Content-Type": (doc.metadata?.contentType as string | undefined) ?? "application/octet-stream",
      // Each upload gets a new id, so a URL's content never changes.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
