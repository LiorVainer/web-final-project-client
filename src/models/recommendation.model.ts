import { z } from 'zod';

const CommentSchema = z.object({
    _id: z.string(),
    postId: z.string(),
    userId: z.string(),
    content: z.string(),
    createdAt: z.date(),
});

const RecommendationSchema = z.object({
    _id: z.string(),
    matchId: z.string(),
    description: z.string(),
    likes: z.array(z.string()),
    comments: z.array(CommentSchema),
    pictureId: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Comment = z.infer<typeof CommentSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;