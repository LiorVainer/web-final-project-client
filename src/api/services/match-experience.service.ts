import { z } from 'zod';
import { axiosInstance } from '../config/axios-instance';
import {
    CreateMatchExperienceBody,
    MatchExperience,
    MatchExperiencePayloadSchema,
    MatchExperienceSchema,
    PaginatedMatchExperiencesSchema,
} from '@/models/match-experience.model';
import { ROUTES } from '@/constants/routes.const';
import { OkResponseSchema } from '@/models/response.model.ts';

export const ROUTE_PREFIX = ROUTES.MATCH_EXPERIENCE;

export const MatchExperienceService = {
    async getAllMatchExperience(page = 1, limit = 5, sortBy = "date") {
        try {
            const response = await axiosInstance.get(ROUTE_PREFIX, {
                params: { page, limit, sortBy },
            });
    
            const { data, success, error } = PaginatedMatchExperiencesSchema.safeParse(response.data);
            if (!success) {
                console.error("Invalid response format for paginated match experiences:", error);
            }
    
            return data;
        } catch (error) {
            console.error("Error fetching matchExperience:", error);
            throw error;
        }
    },

    async getAllMatchExperiencesByUserId(userId: string, page = 1, limit = 5, sortBy = "date") {
        try {
            const response = await axiosInstance.get(`${ROUTE_PREFIX}/user/${userId}`, {
                params: { page, limit, sortBy },
            });

            const { data, success, error } = PaginatedMatchExperiencesSchema.safeParse(response.data);
            if (!success) {
                console.error(`Invalid response format for user ${userId} match experiences:`, error);
            }

            return data;
        } catch (error) {
            console.error(`Error fetching match experiences for user ${userId}:`, error);
            throw error;
        }
    },

    async getMatchExperienceById(id: string) {
        try {
            const response = await axiosInstance.get<MatchExperience>(`${ROUTE_PREFIX}/${id}`);

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

    async betterDescription(matchExperienceData: Partial<CreateMatchExperienceBody>) {
        try {
            const { data } = await axiosInstance.get<string>(`${ROUTE_PREFIX}/better-description`, {
                params: { ...matchExperienceData },
            });

            if (!data) {
                console.error('Not valid response for generating text');
            }

            return data;
        } catch (error) {
            console.error('Error fetching chat:', error);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
