import { z } from "zod";

export const sendFlashSchema = z.object({
    text: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s,.æøåÆØÅ]+$/, "Only letters, numbers, spaces, commas, and periods are allowed")
})