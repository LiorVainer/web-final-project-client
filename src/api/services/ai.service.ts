import { axiosInstance } from '@api/config/axios-instance.ts';
import { ROUTES } from '@/constants/routes.const';

export const AiService = {
    async generateText(prompt: string) {
        try {
            const { data } = await axiosInstance.get<string>(`${ROUTES.AI}/generate-text`, { params: { prompt } });

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
