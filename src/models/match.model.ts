import { z } from 'zod';

export const MatchSchema = z.object({
    _id: z.string(),
    homeTeam: z.string(),
    awayTeam: z.string(),
    date: z.date(),
    league: z.string(),
    country: z.string(),
    stadium: z.string(),
    createdAt: z.date(),
});

export const MatchPayloadSchema = MatchSchema.omit({ createdAt: true });

export const CreateMatchSchema = MatchPayloadSchema.omit({ _id: true });

export type Match = z.infer<typeof MatchSchema>;
export type CreateMatchBody = z.infer<typeof CreateMatchSchema>;
