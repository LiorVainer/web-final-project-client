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

export const RecommendationPayloadSchema = z.object({
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

export const RecommendationSchema = RecommendationPayloadSchema.extend({
    createdAt: zodDate,
    updatedAt: zodDate,
    createdBy: UserSchema.omit({ password: true }),
    comments: z.array(CommentSchema),
});

export const CreateRecommendationSchema = RecommendationPayloadSchema.omit({ _id: true, likes: true }).extend({
    createdBy: z.string(),
});

export type Comment = z.infer<typeof CommentSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;

export type CreateRecommendationBody = z.infer<typeof CreateRecommendationSchema>;
