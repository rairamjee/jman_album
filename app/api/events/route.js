// app/api/events/route.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET method to fetch all events
export async function GET(req) {
  try {
    const events = await prisma.event.findMany();
    return new Response(JSON.stringify(events), { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return new Response(JSON.stringify({ error: "Error fetching events" }), {
      status: 500,
    });
  }
}

// POST method to create a new event
export async function POST(req) {
  try {
    const body = await req.json(); // Parse the request body
    const { eventName, eventLocation, eventDate } = body;

    if (!eventName || !eventLocation || !eventDate) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        eventName,
        eventLocation,
        eventDate: new Date(eventDate), // Convert the eventDate to Date format
      },
    });

    return new Response(JSON.stringify(event), { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return new Response(JSON.stringify({ error: "Error creating event" }), {
      status: 500,
    });
  }
}
