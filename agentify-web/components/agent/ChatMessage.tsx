'use client';

import { IChatMessage } from '@/types';
import ReactMarkdown from 'react-markdown';
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
            className={`max-w-[85%] rounded-lg p-3 whitespace-pre-wrap ${message.role === 'user'
                ? 'bg-accent text-white'
                : 'bg-[#eff2f5] text-gray-800'
              }`}
          >
            {message.role === 'assistant' ? (
              <div className="markdown-content">
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="text-primary underline font-medium"
                      />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              message.content
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessage;
