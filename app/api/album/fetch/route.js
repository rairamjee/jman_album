import {  PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = parseInt(searchParams.get("eventId"));
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    const images = await prisma.image.findMany({
      where: {
        eventId: eventId,
      },
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(images), { status: 200 });
  } catch (error) {
    console.error("Error fetching images:", error);
    return new Response(JSON.stringify({ error: "Error fetching images" }), {
      status: 500,
    });
  }
}