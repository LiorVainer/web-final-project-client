import { axiosInstance } from '../config/axios-instance';
import { CreateMatchBody, CreateMatchSchema, Match, MatchPayloadSchema } from '@/models/match.model.ts';
import { GetByQuery } from '../config/query.types';

export const ROUTE_PREFIX = '/matches';

export const MatchService = {
    async getAllMatches(query: GetByQuery<Match> = {}) {
        try {
            const { data } = await axiosInstance.get<Match[]>(ROUTE_PREFIX, { params: query });
            return data;
        } catch (error) {
            console.error('Error fetching matches:', error);
            throw error;
        }
    },

    async createMatch(matchData: CreateMatchBody) {
        try {
            const response = await axiosInstance.post(ROUTE_PREFIX, matchData);

            const { data: match, success, error } = MatchPayloadSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for creating match:', error);
            }

            return match;
        } catch (error) {
            console.error('Error creating match:', error);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
