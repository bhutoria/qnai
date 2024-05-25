import { prisma } from "./prisma";

export async function getRole(id: string) {
  try {
    const user = await prisma.users.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");
    const role = user.role;
    return role;
  } catch (e) {
    console.log(e);
    return null;
  }
}
