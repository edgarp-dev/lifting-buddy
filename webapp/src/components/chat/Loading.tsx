import { RobotIcon } from "../ui/icons";

export function Loading() {
    return (
        <div className="flex justify-start mb-4">
            <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <RobotIcon size={20} className="text-white" />
                </div>
                <div className="rounded-lg px-4 py-3 bg-gray-800">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}