import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { key, fileName, contentType, eventId } = body;

    if (!key || !fileName || !contentType || !eventId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Save image details to the database
    const newImage = await prisma.image.create({
      data: {
        key,
        fileName,
        contentType,
        s3Url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`,
        eventId: parseInt(eventId),
      },
    });

    return new Response(
      JSON.stringify({ image_id: newImage.id }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving image details:", error);

    return new Response(
      JSON.stringify({ error: "Error saving image details" }),
      { status: 500 }
    );
  }
}
