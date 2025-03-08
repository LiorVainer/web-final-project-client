import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Chat, ChatMessage, ChatMessageSchema, GetChatQueryParams, SendMessagePayload } from '@/models/chat.model.ts';
import { ChatService } from '@api/services/chat.service.ts';
import { SERVER_URL } from '@api/config/axios-instance.ts';

export const useChat = (chatParams: GetChatQueryParams) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const socketRef = useRef<Socket | null>(null); // Persist socket across renders

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(SERVER_URL, {
                transports: ['websocket'],
            });
            ChatService.getChat(chatParams).then((chat) => chat && setChat(chat));
        }
        console.log('chatParams', chatParams);

        socketRef.current.emit('joinRoom', chatParams);

        // Fetch existing chat messages from API

        // Receive new messages in real-time
        socketRef.current.on('receiveMessage', (message: ChatMessage) => {
            const parsed = ChatMessageSchema.safeParse(message);

            if (!parsed.success) {
                console.error('Invalid message received:', parsed.error);
                return;
            }

            setChat((prevChat) => {
                if (!prevChat) {
                    return null;
                }

                return {
                    ...prevChat,
                    messages: [...prevChat.messages, message],
                };
            });
        });

        return () => {
            if (socketRef.current) {
                console.log('❌ WebSocket Disconnected:', socketRef.current.id);
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const sendMessage = (content: string) => {
        const { matchExperienceId, matchExperienceCreatorId, visitorId } = chatParams;
        const messagePayload: SendMessagePayload = {
            matchExperienceId,
            senderId: visitorId,
            receiverId: matchExperienceCreatorId,
            content,
        };

        console.log('messagePayload', messagePayload);

        if (socketRef.current) {
            socketRef.current.emit('sendMessage', messagePayload);
        }
    };

    return {
        sendMessage,
        chat,
        messages: chat?.messages,
        visitor: chat?.visitor,
        matchExperienceCreator: chat?.matchExperienceCreator,
    };
};
