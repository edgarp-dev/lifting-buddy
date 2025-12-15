'use client';

import { useState } from 'react';
import { SendIcon } from '../ui/icons';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSubmit = () => {
        const trimmedInput = input.trim();
        if (trimmedInput && !disabled) {
            onSendMessage(trimmedInput);
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="border-t border-gray-800 p-4 bg-gray-950">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about exercises, form..."
                    disabled={disabled}
                    className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    onClick={handleSubmit}
                    disabled={disabled || !input.trim()}
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                >
                    <SendIcon size={20} />
                </button>
            </div>
        </div>
    );
}