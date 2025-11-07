'use client';

import parse from 'html-react-parser';
import { FC } from 'react';

const ChatMessage: FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-lg bg-[#eff2f5] p-3">
          {parse(`Hi! I'm your AI Chief of Staff. I can help you with:

    • Strategic Prioritization - Find top client opportunities
    • Next Best Action - Get personalized recommendations
    • Performance Reporting - Check your metrics instantly
    • CRM Data Entry - Log meetings naturally

    How can I assist you today?`)}
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-accent p-3">
          {parse(`Hi! I'm your AI Chief of Staff. I can help you with:

    • Strategic Prioritization - Find top client opportunities
    • Next Best Action - Get personalized recommendations
    • Performance Reporting - Check your metrics instantly
    • CRM Data Entry - Log meetings naturally

    How can I assist you today?`)}
        </div>
      </div>
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-lg bg-[#eff2f5] p-3">
          {parse(`Hi! I'm your AI Chief of Staff. I can help you with:

    • Strategic Prioritization - Find top client opportunities
    • Next Best Action - Get personalized recommendations
    • Performance Reporting - Check your metrics instantly
    • CRM Data Entry - Log meetings naturally

    How can I assist you today?`)}
        </div>
      </div>
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-lg bg-[#eff2f5] p-3">
          {parse(`Hi! I'm your AI Chief of Staff. I can help you with:

    • Strategic Prioritization - Find top client opportunities
    • Next Best Action - Get personalized recommendations
    • Performance Reporting - Check your metrics instantly
    • CRM Data Entry - Log meetings naturally

    How can I assist you today?`)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
