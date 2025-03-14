import { z } from 'zod';
import { PublicUser, PublicUserSchema, User, UserSchema } from '../../models/user.model';
import { axiosInstance } from '../config/axios-instance';

export const ROUTE_PREFIX = '/users';

export const UsersService = {
    async getUsers() {
        try {
            const response = await axiosInstance.get<PublicUser[]>(ROUTE_PREFIX);

            const parsedResponse = PublicUserSchema.array().safeParse(response.data);

            if (!parsedResponse.success) {
                console.error('Invalid response for fetching users:', parsedResponse.error);
                return []; 
            }

            return parsedResponse.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    async getUserById(userId: string) {
        try {
            const response = await axiosInstance.get<User>(`${ROUTE_PREFIX}/${userId}`);

            const { data: user, success, error } = UserSchema.safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for fetching user with ${userId}`, error);
            }

            return user;
        } catch (error) {
            console.error(`Error fetching user with ID ${userId}:`, error);
            throw error;
        }
    },

    async createUser(userData: User) {
        try {
            const response = await axiosInstance.post(ROUTE_PREFIX, userData);

            const { data: user, success, error } = UserSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for creating user:', error);
            }

            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async updateUser(userId: string, userData: User) {
        try {
            const response = await axiosInstance.put(`${ROUTE_PREFIX}/${userId}`, userData);

            const { data: user, success, error } = UserSchema.safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for updating user with ID ${userId}:`, error);
            }

            return user;
        } catch (error) {
            console.error(`Error updating user with ID ${userId}:`, error);
            throw error;
        }
    },

    async deleteUser(userId: string) {
        try {
            const response = await axiosInstance.delete(`${ROUTE_PREFIX}/${userId}`);

            const { data: resUserId, success, error } = z.string().safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for deleting user with ID ${userId}:`, error);
            }

            return resUserId;
        } catch (error) {
            console.error(`Error deleting user with ID ${userId}:`, error);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
