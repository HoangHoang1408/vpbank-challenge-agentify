'use client';

import { IChatMessage } from '@/types';
import { FC } from 'react';

interface ChatMessageProps {
  messages: IChatMessage[];
}

const ChatMessage: FC<ChatMessageProps> = ({ messages }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-lg p-3 whitespace-pre-wrap ${
              message.role === 'user'
                ? 'bg-accent text-white'
                : 'bg-[#eff2f5] text-gray-800'
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessage;
