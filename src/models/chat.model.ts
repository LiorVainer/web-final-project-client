import { z } from 'zod';

export const ChatSchema = z.object({
    _id: z.string(),
    postId: z.string(),
    participants: z.array(z.string()), // Array of userIds
    messages: z.array(
        z.object({
            senderId: z.string(),
            content: z.string(),
            createdAt: z.date(),
        }),
    ),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Chat = z.infer<typeof ChatSchema>;