import { axiosInstance } from '@api/config/axios-instance.ts';
import { Chat, ChatSchema, GetChatQueryParams } from '@/models/chat.model.ts';

export const ROUTE_PREFIX = '/chat';

export const ChatService = {
    async getChat({ matchExperienceId, matchExperienceCreatorId, visitorId }: GetChatQueryParams) {
        try {
            const response = await axiosInstance.get<Chat>(
                ROUTE_PREFIX +
                    `?matchExperienceId=${matchExperienceId}&` +
                    `visitorId=${visitorId}&` +
                    `matchExperienceCreatorId=${matchExperienceCreatorId}`
            );

            const { data: chat, success, error } = ChatSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for fetching users:', error);
            }

            return chat;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
