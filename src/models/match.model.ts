import { z } from 'zod';

export const MatchSchema = z.object({
    _id: z.string(),
    homeTeam: z.string(),
    awayTeam: z.string(),
    date: z.date(),
    competition: z.string(),
    country: z.string(),
    stadium: z.string(),
    createdAt: z.date(),
});

export const MatchPayloadSchema = MatchSchema.omit({ createdAt: true });

export type Match = z.infer<typeof MatchSchema>;
