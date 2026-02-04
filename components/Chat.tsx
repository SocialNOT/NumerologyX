
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { UserIcon } from './icons/UserIcon';
import { StarIcon } from './icons/StarIcon';
import { SendIcon } from './icons/SendIcon';
import { LinkIcon } from './icons/LinkIcon';

interface ChatProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-14rem)]">
            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <StarIcon className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div className="max-w-xs md:max-w-md">
                            <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600/80 rounded-br-none' : 'bg-gray-700/60 rounded-bl-none'}`}>
                                <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]"></span>
                                            Verified Sources
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {msg.sources.map((source, i) => (
                                                <a 
                                                    key={i} 
                                                    href={source.uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="flex items-center gap-1.5 px-2 py-1.5 bg-black/40 hover:bg-cyan-900/30 rounded-lg text-xs text-cyan-300 hover:text-cyan-200 transition-all border border-white/5 hover:border-cyan-500/30 group max-w-full"
                                                >
                                                    <LinkIcon className="w-3 h-3 flex-shrink-0 opacity-70 group-hover:opacity-100" />
                                                    <span className="truncate max-w-[180px]">{source.title || new URL(source.uri).hostname}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                         {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-5 h-5 text-gray-300" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                           <StarIcon className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-700/60 rounded-bl-none">
                            <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-cyan-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-cyan-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-cyan-300 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-6">
                <form onSubmit={handleSend} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask the cosmos..."
                        className="w-full bg-black/20 border border-white/30 rounded-full py-3 pl-5 pr-14 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-white bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full m-1 transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                       <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
