import { z } from 'zod';
import { zodDate } from '@/utils/zod.utils.ts';

export const UserSchema = z.object({
    username: z.string(),
    password: z.string(),
    email: z.string(),
    picture: z.string(),
    createdAt: zodDate,
    updatedAt: zodDate,
    refreshTokens: z.string().array().optional(),
});

export const RegisterPayload = UserSchema.omit({ createdAt: true, updatedAt: true });
export type RegisterPayload = z.infer<typeof RegisterPayload>;

export const LoginPayload = UserSchema.pick({ email: true, password: true });
export type LoginPayload = z.infer<typeof LoginPayload>;

export type User = z.infer<typeof UserSchema>;

export const UserWithIdSchema = UserSchema.extend({
    _id: z.string(),
});

export const PublicUserSchema = UserWithIdSchema.omit({
    password: true,
    refreshTokens: true,
});

export const AuthUserResponseSchema = PublicUserSchema.extend({
    accessToken: z.string(),
    refreshToken: z.string(),
});

export type PublicUser = z.infer<typeof PublicUserSchema>;

export type UserWithId = z.infer<typeof UserWithIdSchema>;

export const UserWithoutTimestampsSchema = UserSchema.omit({
    createdAt: true,
    updatedAt: true,
});

export type UserPayload = z.infer<typeof UserWithoutTimestampsSchema>;
