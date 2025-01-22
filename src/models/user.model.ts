import { z } from 'zod';

export const UserSchema = z.object({
    _id: z.string(),
    username: z.string(),
    password: z.string(),
    email: z.string().email(),
    pictureId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;