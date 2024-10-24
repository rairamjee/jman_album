import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const s3 = new S3({
  accessKeyId: process.env.UPLOAD_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.UPLOAD_AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { original_filename, content_type, event_id } = body;

    if (!original_filename || !content_type || !event_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Verify that the event exists
    const event = await prisma.event.findUnique({
      where: { id: parseInt(event_id) },
    });

    if (!event) {
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { status: 404 }
      );
    }

    const ext = original_filename.split(".").pop().toLowerCase();
    const date = format(new Date(), "yyyyMMdd");
    const key = `uploads/${date}-${uuidv4()}.${ext}`;
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;

    // Generate pre-signed URL
    const presignedUploadUrl = await s3.getSignedUrlPromise("putObject", {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: content_type,
      Expires: 60 * 60, // 1 hour expiration
    });

    // Return presigned URL and the key
    return new Response(
      JSON.stringify({
        key,
        presigned_upload_url: presignedUploadUrl,
        s3Url,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);

    return new Response(
      JSON.stringify({ error: "Error generating presigned URL" }),
      { status: 500 }
    );
  }
}
