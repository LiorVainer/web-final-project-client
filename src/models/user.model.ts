import { zodDate } from '@/types/common.types';
import { z } from 'zod';

export const UserSchema = z.object({
    _id: z.string(),
    username: z.string(),
    password: z.string(),
    email: z.string().email(),
    picture: z.string(),
    createdAt: zodDate,
    updatedAt: zodDate,
});

export const RegisterPayload = UserSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export type RegisterPayload = z.infer<typeof RegisterPayload>;

export const LoginPayload = UserSchema.pick({ email: true, password: true });
export type LoginPayload = z.infer<typeof LoginPayload>;

export type User = z.infer<typeof UserSchema>;
