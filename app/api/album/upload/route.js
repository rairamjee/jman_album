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
    const { original_filename, content_type } = body;

    if (!original_filename || !content_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
        }
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
      Expires: 60, // 1 minute
    });

    // Save image details to the database
    const newImage = await prisma.image.create({
      data: {
        key,
        fileName: original_filename,
        contentType: content_type,
        s3Url,
      },
    });

    return new Response(
      JSON.stringify({
        key,
        presigned_upload_url: presignedUploadUrl,
        image_id: newImage.id,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);

    return new Response(
      JSON.stringify({
        error: "Error generating presigned URL or saving data",
      }),
      {
        status: 500,
      }
    );
  }
}
