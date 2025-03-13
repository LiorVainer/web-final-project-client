import { AuthUserResponseSchema, LoginPayload, PublicUserSchema, RegisterPayload } from '@/models/user.model.ts';
import { axiosInstance } from '../config/axios-instance';

export const ROUTE_PREFIX = '/auth';

export const AuthService = {
    async register(userData: RegisterPayload) {
        try {
            const response = await axiosInstance.post(`${ROUTE_PREFIX}/register`, userData);

            const { data: user, success, error } = AuthUserResponseSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for registration:', error);
            }

            return user;
        } catch (error) {
            console.error('Error in registartion:', error);
            throw error;
        }
    },
    async login(userData: LoginPayload) {
        try {
            const response = await axiosInstance.post(`${ROUTE_PREFIX}/login`, userData);

            const { data: user, success, error } = PublicUserSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for login:', error);
            }

            return user;
        } catch (error) {
            console.error('Error in login:', error);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
