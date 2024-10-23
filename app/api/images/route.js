import aws from "aws-sdk";
import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const region = process.env.AWS_REGION;
const bucketName = process.env.BUCKET_NAME;
const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion: 'v4'
});

export async function generateUploadURL(filename) {
    const imageName = `uploads/${Date.now()}-${filename}`;

    const params = {
        Bucket: bucketName,
        Key: imageName,
        Expires: 60
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    return uploadUrl;
}

export async function POST(req) {
    try {
        const { filename } = await req.json(); // Assuming the filename is sent in the request body
        const uploadUrl = await generateUploadURL(filename);
        return new Response(JSON.stringify({ uploadUrl }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Could not generate upload URL' }), { status: 500 });
    }
}
