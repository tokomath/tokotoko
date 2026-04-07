"use server";

import { clerkClient } from "@clerk/nextjs/server";

export async function getClerkUsersImages(userIds: string[]) {
  const client = await clerkClient();
  const users = await client.users.getUserList({
    userId: userIds,
  });
  
  return users.data.map(u => ({
    id: u.id,
    imageUrl: u.imageUrl
  }));
}