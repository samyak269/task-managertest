import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import * as jose from "jose";

export async function GET(request: Request) {
  // Assuming the JWT token will be sent in the Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      {
        error: "Missing or invalid authorization token",
      },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    
    const curruser = await prisma.user.findUnique({
      where: {
        id: parseInt(payload.sub || ""),
      },
    });

    if (!curruser || curruser.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Access denied. Only admins can access this route.",
        },
        { status: 403 }
      );
    }

    // Fetch all users from the database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    // Return the list of users
    return NextResponse.json(users, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Invalid token or server error",
      },
      { status: 500 }
    );
  }
}
