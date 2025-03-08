import { z } from 'zod';
import { zodDate } from '@/utils/zod.utils.ts';

export const UserSchema = z.object({
    username: z.string(),
    password: z.string(),
    email: z.string(),
    pictureId: z.string(),
    createdAt: zodDate,
    updatedAt: zodDate,
    refreshTokens: z.string().array().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const UserWithIdSchema = UserSchema.extend({
    _id: z.string(),
});

export const PublicUserSchema = UserWithIdSchema.omit({
    password: true,
    refreshTokens: true,
});

export type PublicUser = z.infer<typeof PublicUserSchema>;

export type UserWithId = z.infer<typeof UserWithIdSchema>;

export const UserWithoutTimestampsSchema = UserSchema.omit({
    createdAt: true,
    updatedAt: true,
});

export type UserPayload = z.infer<typeof UserWithoutTimestampsSchema>;
