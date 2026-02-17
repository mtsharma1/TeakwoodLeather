"use server"

import prisma from "./prisma"
import bcryptjs from 'bcryptjs';


export const saltAndHashPassword = async (planPassword: string) => {
   try {
      const rounds = await bcryptjs.genSalt(10);
      return bcryptjs.hashSync(planPassword, rounds);
   } catch (error) {
      console.log(error, "[saltAndHashPassword]")
   }
}

export const getUserFromDb = async (email: string, plainPassword: string) => {
   try {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) throw new Error("User not found!")

      const isValid = await bcryptjs.compare(plainPassword, user.password);
      if (isValid) {
         return user;
      }

      return null
   } catch (error) {
      console.log(error, "[getUserFromDb]")
   }
}
