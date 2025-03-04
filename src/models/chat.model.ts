import { zodDate } from '@/types/common.types';
import { z } from 'zod';

export const ChatMessageSchema = z.object({
    senderId: z.string(),
    content: z.string(),
    createdAt: zodDate,
});

export const ChatSchema = z.object({
    _id: z.string(),
    postId: z.string(),
    participants: z.array(z.string()), // Array of userIds
    messages: z.array(ChatMessageSchema),
    createdAt: zodDate,
    updatedAt: zodDate,
});

export type Chat = z.infer<typeof ChatSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
