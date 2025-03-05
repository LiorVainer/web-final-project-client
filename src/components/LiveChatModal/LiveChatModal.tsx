import classes from './live-chat-modal.module.scss';
import { useState } from 'react';
import { Send, X } from 'lucide-react';
import clsx from 'clsx';
import { ChatMessage } from '@/models/chat.model.ts';
import { Input } from 'antd';

export interface LiveChatModalProps {
    messages: ChatMessage[];
    onClose: () => void;
}

export const LiveChatModal = ({ messages, onClose }: LiveChatModalProps) => {
    const [newMessage, setNewMessage] = useState('');
    const handleSendMessage = (message: string) => {
        console.log('Sending message:', message);
        setNewMessage('');
    };

    return (
        <div className={classes.chatModal}>
            <div className={classes.chatHeader}>
                <h3>Live Chat</h3>
                <button onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className={classes.chatMessages}>
                {messages.map((msg) => (
                    <div
                        key={msg.createdAt.getMilliseconds()}
                        className={clsx(classes.message, {
                            [classes.ownMessage]: msg.senderId === 'You',
                        })}
                    >
                        <strong>{msg.senderId}</strong>
                        <p>{msg.content}</p>
                        <span>{msg.senderId}</span>
                    </div>
                ))}
            </div>

            <div className={classes.chatForm}>
                <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className={classes.chatInput}
                />
                <button onClick={() => handleSendMessage(newMessage)} className={classes.sendButton}>
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};
