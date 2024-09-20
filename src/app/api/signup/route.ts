import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  // Read data off req body
  const body = await request.json();
  const { email, password } = body;

  // Validate data
  if (!email || !password) {
    return Response.json(
      {
        error: "missing email or password",
      },
      { status: 400 }
    );
  }
  const user = await prisma.user.findFirst({
    where: {
      email:email,
    },
  });
  const hash = bcrypt.hashSync(password, 8);

  
  if(user){ return Response.json({message: "User already exists"}, {status: 400});}
  // Create a user if it doesn't exist
  else{
    await prisma.user.create({
      data: {
        email:email,
        password: hash,

      },
    });
  }
  


  return Response.json({message: "User created"}, {status: 200});
}
