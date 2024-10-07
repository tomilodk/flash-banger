import { z } from "zod";

export const setNameSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }).max(10, {
      message: "Name must be at most 10 characters.",
    }).regex(/^[a-zA-Z]+$/, {
      message: "Name must only contain letters, and no spaces",
    }),
  })
  