import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must not exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),

  clientId: z
    .string()
    .uuid("Invalid client ID"),

  managerId: z
    .string()
    .uuid("Invalid manager ID")
    .optional(),
});