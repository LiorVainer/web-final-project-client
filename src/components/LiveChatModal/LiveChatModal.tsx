import classes from './live-chat-modal.module.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import clsx from 'clsx';
import { Input } from 'antd';
import { useChat } from '@hooks/useChat.hooks.ts';
import moment from 'moment';
import { ChatMessage } from '@/models/chat.model.ts'; // Import moment.js for formatting timestamps

export interface LiveChatModalProps {
    matchExperienceId: string;
    visitorId: string;
    creatorId: string;
    loggedInUserId: string;
    onClose: () => void;
}

export const LiveChatModal = ({
    matchExperienceId,
    visitorId,
    creatorId,
    loggedInUserId,
    onClose,
}: LiveChatModalProps) => {
    const [newMessage, setNewMessage] = useState('');
    const { messages, sendMessage, visitor, matchExperienceCreator } = useChat({
        matchExperienceId,
        visitorId,
        matchExperienceCreatorId: creatorId,
    });

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage(''); // Clear input after sending
        }
    };

    // Determines the label for each message's date
    const formatMessageDate = useCallback((date: Date | undefined) => {
        const messageDate = moment(date);
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'days').startOf('day');

        if (messageDate.isSame(today, 'day')) return 'Today';
        if (messageDate.isSame(yesterday, 'day')) return 'Yesterday';
        return messageDate.format('MMMM D, YYYY'); // Example: "March 7, 2024"
    }, []);

    // Determines if a date separator should be shown
    const shouldShowDateSeparator = useCallback(
        (index: number) => {
            if (index === 0) return true; // Always show separator for first message
            const currentDate = formatMessageDate(messages?.at(index)?.createdAt);
            const previousDate = formatMessageDate(messages?.at(index - 1)?.createdAt);
            return currentDate !== previousDate;
        },
        [messages, formatMessageDate]
    );

    // Renders a chat message
    const renderMessage = useCallback(
        (msg: ChatMessage, index: number) => {
            const showDateSeparator = shouldShowDateSeparator(index);
            return (
                <div key={index}>
                    {showDateSeparator && (
                        <div className={classes.dateSeparator}>{formatMessageDate(msg.createdAt)}</div>
                    )}
                    <div
                        className={clsx(classes.message, {
                            [classes.ownMessage]: msg.senderId === loggedInUserId,
                        })}
                    >
                        <p>{msg.content}</p>
                        <span className={classes.timestamp}>{moment(msg.createdAt).format('hh:mm')}</span>
                    </div>
                </div>
            );
        },
        [visitorId, shouldShowDateSeparator, formatMessageDate]
    );

    return (
        <div className={classes.chatModal}>
            <div className={classes.chatHeader}>
                <h3>{visitorId === visitor?._id ? matchExperienceCreator?.username : visitor?.username}</h3>
                <button onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className={classes.chatMessages}>
                {messages?.map(renderMessage)}
                <div ref={messagesEndRef} className={classes.scrollAnchor} />
            </div>

            <div className={classes.chatForm}>
                <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className={classes.chatInput}
                    onPressEnter={handleSendMessage}
                />
                <button onClick={handleSendMessage} className={classes.sendButton}>
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};
