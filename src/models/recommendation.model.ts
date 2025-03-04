import { z } from 'zod';
import { UserSchema } from '@/models/user.model.ts';
import { MatchSchema } from '@/models/match.model.ts';
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
    matchId: z.string(),
    title: z.string(),
    description: z.string(),
    likes: z.array(z.string()),
    picture: z.string().optional(),
});

export const RecommendationSchema = RecommendationPayloadSchema.omit({ matchId: true }).extend({
    createdAt: zodDate,
    updatedAt: zodDate,
    createdBy: UserSchema.omit({ password: true }),
    match: MatchSchema,
    comments: z.array(CommentSchema),
});

export const CreateRecommendationSchema = RecommendationPayloadSchema.omit({ _id: true, likes: true }).extend({
    createdBy: z.string(),
});

export type Comment = z.infer<typeof CommentSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;

export type CreateRecommendationBody = z.infer<typeof CreateRecommendationSchema>;
