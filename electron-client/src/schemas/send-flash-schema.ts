import { z } from "zod";

export const sendFlashSchema = z.object({
    text: z.string().min(1).max(250).regex(/^[a-zA-Z0-9\s,.æøåÆØÅ?\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]]+$/, "Only letters, numbers, spaces, commas, and periods are allowed")
})