// ──────────────────────────────────────────────────────
// ToolNest — User Database Service
// ──────────────────────────────────────────────────────

import prisma from "@/lib/prisma";

export interface CreateUserInput {
  email: string;
  name?: string;
  image?: string;
}

/**
 * Create a new user account.
 * Used during registration or first OAuth sign-in.
 */
export async function createUser(input: CreateUserInput) {
  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      image: input.image,
      preferences: {
        create: {},
      },
    },
  });
}

/**
 * Find a user by their ID.
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
    },
  });
}

/**
 * Find a user by email.
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Update user profile information.
 * Only allows updating own profile.
 */
export async function updateUser(
  id: string,
  data: { name?: string; image?: string }
) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      updatedAt: true,
    },
  });
}

/**
 * Delete a user and all associated data (cascading).
 */
export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}
