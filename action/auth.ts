"use server"

import { signIn } from "@/auth"
import { saltAndHashPassword } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"

export async function signInCred(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password) {
    return { error: "Please provide both email and password.", success: false }
  }

  if (name) {
    const isAlreadyExist = await prisma.user.findFirst({
      where: {
        email
      }
    })
    if (isAlreadyExist) {
      return { error: "User Already Exist", success: false }
    }

    const hashPass = await saltAndHashPassword(password)
    if (!hashPass) return { error: "Some error occured", success: false }

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashPass
      }
    })
    return { error: null, success: true };
  }
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    return { success: true }
  } catch {
    return { error: "Invalid credentials.", success: false }
  }
}

