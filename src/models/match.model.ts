import { zodDate } from '@/types/common.types';
import { z } from 'zod';

export const MatchSchema = z.object({
    _id: z.string(),
    homeTeam: z.string(),
    awayTeam: z.string(),
    date: zodDate,
    league: z.string(),
    country: z.string(),
    stadium: z.string(),
    createdAt: zodDate,
});

export const MatchPayloadSchema = MatchSchema.omit({ createdAt: true });

export const CreateMatchSchema = MatchPayloadSchema.omit({ _id: true });

export type Match = z.infer<typeof MatchSchema>;
export type CreateMatchBody = z.infer<typeof CreateMatchSchema>;

export type Country = { name: string; code: string; flag: string };
export type League = { id: number; name: string; type: string; logo: string };
export type Venue = {
    id: number;
    name: string;
    address: string;
    city: string;
    country: string;
    capacity: number;
    surface: string;
    image: string;
};
export type Team = {
    id: number;
    name: string;
    code: string;
    country: string;
    founded: number;
    national: boolean;
    logo: string;
};
