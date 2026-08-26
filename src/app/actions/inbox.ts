"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function getMessages() {
  await requireAdmin();
  return await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function markAsRead(id: number) {
  await requireAdmin();
  await prisma.contactMessage.update({
    where: { id },
    data: { isRead: true },
  });
  revalidatePath("/admin/inbox");
  revalidatePath("/admin"); // Revalidate admin layout for counter
}

export async function deleteMessage(id: number) {
  await requireAdmin();
  await prisma.contactMessage.delete({
    where: { id },
  });
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
}

export async function getUnreadCount() {
  await requireAdmin();
  return await prisma.contactMessage.count({
    where: { isRead: false },
  });
}
