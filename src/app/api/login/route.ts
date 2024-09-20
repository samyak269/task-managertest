
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import * as jose from "jose";

export async function POST(request: Request) {
  // Read data off req body
  const body = await request.json();
  const { email, password } = body;

  // Validate data
  if (!email || !password) {
    return Response.json(
      {
        error: "Invalid email or password",
      },
      { status: 400 }
    );
    
  }

  // Lookup the user
  const user = await prisma.user.findFirst({
    where: {
      email:email,
    },
  });

  if (!user) {
    return Response.json(
      {
        error: "Invalid user",
      },
      { status: 400 }
    );
  }

  // Compare password
  const isCorrectPassword = bcrypt.compareSync(password, user.password);

  if (!isCorrectPassword) {
    return Response.json(
      {
        error: "Invalid email or password",
      },
      { status: 400 }
    );
  }

  // Create jwt token
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const alg = "HS256";

  const jwt = await new jose.SignJWT({})
    .setProtectedHeader({ alg })
    .setExpirationTime("72h")
    .setSubject(user.id.toString())
    .sign(secret);
  console.log("user logged in,", jwt);
  // Respond with it
  return Response.json({ token: jwt });
}
