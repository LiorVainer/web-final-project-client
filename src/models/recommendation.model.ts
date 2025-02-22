import { z } from 'zod';
import { UserSchema } from '@/models/user.model.ts';
import { MatchSchema } from '@/models/match.model.ts';

const CommentSchema = z.object({
    _id: z.string(),
    postId: z.string(),
    userId: z.string(),
    content: z.string(),
    createdAt: z.date(),
});

export const RecommendationPayloadSchema = z.object({
    _id: z.string(),
    matchId: z.string(),
    title: z.string(),
    description: z.string(),
    likes: z.array(z.string()),
    pictureId: z.string().optional(),
});

export const RecommendationSchema = RecommendationPayloadSchema.omit({ matchId: true }).extend({
    createdAt: z.date(),
    updatedAt: z.date(),
    createdBy: UserSchema.omit({ password: true }),
    match: MatchSchema,
    comments: z.array(CommentSchema),
});

export type Comment = z.infer<typeof CommentSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
