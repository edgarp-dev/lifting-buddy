'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from "@/types";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { Loading } from "@/components/chat/Loading";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { api } from "@/lib/api";

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = async (content: string) => {
        const userMessage: ChatMessageType = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setError(null);

        try {
            const response = await api.sendChatMessage(content);

            const assistantMessage: ChatMessageType = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.answer,
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message');
            console.error('Chat error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <ChatHeader />
            <main className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">
                            Ask me anything about your workouts!
                        </p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        {messages.map(message => (
                            <ChatMessage key={message.id} message={message} />
                        ))}
                        {loading && <Loading />}
                        <div ref={messagesEndRef} />
                    </div>
                )}
                {error && (
                    <div className="max-w-4xl mx-auto mt-4">
                        <div className="bg-red-900/20 border border-red-900 text-red-400 px-4 py-2 rounded-lg">
                            {error}
                        </div>
                    </div>
                )}
            </main>
            <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
        </div>
    );
}