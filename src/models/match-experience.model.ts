import { z } from 'zod';
import { UserSchema } from '@/models/user.model.ts';
import { zodDate } from '@/types/common.types';

const CommentSchema = z.object({
    _id: z.string(),
    postId: z.string(),
    userId: z.string(),
    content: z.string(),
    createdAt: zodDate,
});

export const MatchExperiencePayloadSchema = z.object({
    _id: z.string(),
    title: z.string(),
    description: z.string(),
    likes: z.array(z.string()),
    homeTeam: z.string(),
    awayTeam: z.string(),
    matchDate: zodDate,
    league: z.string(),
    country: z.string(),
    stadium: z.string(),
    picture: z.string().optional(),
});

export const MatchExperienceSchema = MatchExperiencePayloadSchema.extend({
    createdAt: zodDate,
    updatedAt: zodDate,
    createdBy: UserSchema.omit({ password: true }),
    comments: z.array(CommentSchema),
});

export const CreateMatchExperienceSchema = MatchExperiencePayloadSchema.omit({ _id: true, likes: true }).extend({
    createdBy: z.string(),
});

export type Comment = z.infer<typeof CommentSchema>;
export type MatchExperience = z.infer<typeof MatchExperienceSchema>;

export type CreateMatchExperienceBody = z.infer<typeof CreateMatchExperienceSchema>;
