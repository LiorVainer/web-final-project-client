import { z } from 'zod';
import { User } from '../../models/user.model';
import { axiosInstance } from '../config/axios-instance';
import { CreateRecommendationBody, Recommendation, RecommendationPayloadSchema, RecommendationSchema } from '@/models/recommendation.model.ts';

export const ROUTE_PREFIX = '/recommendations';

export const RecommendationService = {
    async getAllRecommendation() {
        try {
            const response = await axiosInstance.get<User[]>(ROUTE_PREFIX);

            const {
                data: recommendations,
                success,
                error,
            } = RecommendationPayloadSchema.array().safeParse(response.data);

            if (!success) {
                console.error('Not valid response for fetching recommendation:', error);
            }

            return recommendations;
        } catch (error) {
            console.error('Error fetching recommendation:', error);
            throw error;
        }
    },

    async getRecommendationById(id: string) {
        try {
            const response = await axiosInstance.get<Recommendation>(`${ROUTE_PREFIX}/${id}`);

            const { data: recommendation, success, error } = RecommendationSchema.safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for fetching recommendation with ${id}`, error);
            }

            return recommendation;
        } catch (error) {
            console.error(`Error fetching recommendation with ID ${id}:`, error);
            throw error;
        }
    },

    async createRecommendation(recommendationData: CreateRecommendationBody) {
        try {
            const response = await axiosInstance.post(ROUTE_PREFIX, recommendationData);

            const { data: recommendation, success, error } = RecommendationPayloadSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for creating recommendation:', error);
            }

            return recommendation;
        } catch (error) {
            console.error('Error creating recommendation:', error);
            throw error;
        }
    },

    async updateRecommendation(id: string, recommendationData: Partial<Recommendation>) {
        try {
            const response = await axiosInstance.put(`${ROUTE_PREFIX}/${id}`, recommendationData);

            const { data: recommendation, success, error } = RecommendationPayloadSchema.safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for updating recommendation with ID ${id}:`, error);
            }

            return recommendation;
        } catch (error) {
            console.error(`Error updating recommendation with ID ${id}:`, error);
            throw error;
        }
    },

    async deleteRecommendation(id: string) {
        try {
            const response = await axiosInstance.delete(`${ROUTE_PREFIX}/${id}`);

            const { data: resRecommendationId, success, error } = z.string().safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for deleting recommendation with ID ${id}:`, error);
            }

            return resRecommendationId;
        } catch (error) {
            console.error(`Error deleting recommendation with ID ${id}:`, error);
            throw error;
        }
    },

    async likeRecommendation(id: string): Promise<void> {
        // This would be replaced with actual API call
        console.log('Liking recommendation:', id);
    },

    async addComment(id: string, comment: string): Promise<void> {
        // This would be replaced with actual API call
        console.log('Adding comment to recommendation:', id, comment);
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
