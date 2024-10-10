import { z } from "zod";

export const sendFlashSchema = z.object({
    text: z.string().min(1).max(250)
})