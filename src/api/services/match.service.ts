import { axiosInstance } from '../config/axios-instance';
import { CreateMatchBody, Match, MatchPayloadSchema } from '@/models/match.model.ts';
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
            const { data } = await axiosInstance.post<Match>(ROUTE_PREFIX, matchData);

            return data;
        } catch (error) {
            console.error('Error creating match:', error);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
