import { z } from 'zod';
import { User } from '../../models/user.model';
import { axiosInstance } from '../config/axios-instance';
import {
    CreateMatchExperienceBody,
    MatchExperience,
    MatchExperiencePayloadSchema,
    MatchExperienceSchema,
} from '@/models/match-experience.model';
import { ROUTES } from '@/constants/routes.const';
import { OkResponseSchema } from '@/models/response.model.ts';

export const ROUTE_PREFIX = ROUTES.MATCH_EXPERIENCE;

export const MatchExperienceService = {
    async getAllMatchExperience() {
        try {
            const response = await axiosInstance.get<User[]>(ROUTE_PREFIX);

            const {
                data: matchExperiences,
                success,
                error,
            } = MatchExperiencePayloadSchema.array().safeParse(response.data);

            if (!success) {
                console.error('Not valid response for fetching matchExperience:', error);
            }

            return matchExperiences;
        } catch (error) {
            console.error('Error fetching matchExperience:', error);
            throw error;
        }
    },

    async getMatchExperienceById(id: string) {
        try {
            const response = await axiosInstance.get<MatchExperience>(`${ROUTE_PREFIX}/${id}`);

            console.log('response', response);

            const { data: matchExperience, success, error } = MatchExperienceSchema.safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for fetching matchExperience with ${id}`, error);
            }

            return matchExperience;
        } catch (error) {
            console.error(`Error fetching matchExperience with ID ${id}:`, error);
            throw error;
        }
    },

    async createMatchExperience(matchExperienceData: CreateMatchExperienceBody) {
        try {
            const response = await axiosInstance.post(ROUTE_PREFIX, matchExperienceData);

            const { data: matchExperience, success, error } = MatchExperiencePayloadSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for creating matchExperience:', error);
            }

            return matchExperience;
        } catch (error) {
            console.error('Error creating matchExperience:', error);
            throw error;
        }
    },

    async updateMatchExperience(id: string, matchExperienceData: Partial<MatchExperience>) {
        try {
            const response = await axiosInstance.put(`${ROUTE_PREFIX}/${id}`, matchExperienceData);

            const { data: matchExperience, success, error } = MatchExperiencePayloadSchema.safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for updating matchExperience with ID ${id}:`, error);
            }

            return matchExperience;
        } catch (error) {
            console.error(`Error updating matchExperience with ID ${id}:`, error);
            throw error;
        }
    },

    async deleteMatchExperience(id: string) {
        try {
            const response = await axiosInstance.delete(`${ROUTE_PREFIX}/${id}`);

            const { data: resMatchExperienceId, success, error } = z.string().safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for deleting matchExperience with ID ${id}:`, error);
            }

            return resMatchExperienceId;
        } catch (error) {
            console.error(`Error deleting matchExperience with ID ${id}:`, error);
            throw error;
        }
    },

    async likeMatchExperience(matchExpId: string, userId: string) {
        try {
            const response = await axiosInstance.post(`${ROUTE_PREFIX}/${matchExpId}/like`, {
                userId,
            });

            console.log('response', response);

            const { data, success, error } = OkResponseSchema.safeParse(response.data);

            if (!success) {
                console.error(error);
            }

            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    async unlikeMatchExperience(matchExpId: string, userId: string) {
        try {
            const response = await axiosInstance.post(`${ROUTE_PREFIX}/${matchExpId}/unlike`, {
                userId,
            });

            console.log('response', response);

            const { data, success, error } = OkResponseSchema.safeParse(response.data);

            if (!success) {
                console.error(error);
            }

            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    async addComment(id: string, comment: string, userId: string) {
        try {
            const response = await axiosInstance.post(`${ROUTE_PREFIX}/${id}/comments`, {
                content: comment,
                userId,
            });

            console.log('response', response);

            const { data, success, error } = z.string().safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for deleting matchExperience with ID ${id}:`, error);
            }

            return data;
        } catch (error) {
            console.error(`Error deleting matchExperience with ID ${id}:`, error);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
