import { ChatMessage as ChatMessageType } from "@/types";
import { RobotIcon } from "../ui/icons";

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <RobotIcon size={20} className="text-white" />
                    </div>
                )}
                <div className={`rounded-lg px-4 py-2 ${isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                    }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            </div>
        </div>
    )
}