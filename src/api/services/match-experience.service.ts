import { z } from 'zod';
import { User } from '../../models/user.model';
import { axiosInstance } from '../config/axios-instance';
import {
    CreateMatchExperienceBody,
    MatchExperience,
    MatchExperiencePayloadSchema,
    MatchExperienceSchema,
} from '@/models/match-experience.model';

export const ROUTE_PREFIX = '/match-experiences';

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

    async likeMatchExperience(id: string): Promise<void> {
        // This would be replaced with actual API call
        console.log('Liking matchExperience:', id);
    },

    async addComment(id: string, comment: string): Promise<void> {
        // This would be replaced with actual API call
        console.log('Adding comment to matchExperience:', id, comment);
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
