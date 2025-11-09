import { cn } from '@/lib/utils';
import { Button, Input, Layout, Typography } from 'antd';
import { FC, useState } from 'react';
import { LuSend, LuSparkles, LuX } from 'react-icons/lu';
import ChatMessage from './ChatMessage';

const AgentChat: FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [messagesInput, setMessagesInput] = useState<string>('');

  return (
    <Layout.Sider
      collapsed={collapsed}
      width={400}
      collapsedWidth={0}
      collapsible
      theme="light"
      className="border-l border-border"
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center bg-primary/5 border-b border-border p-4 h-16">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center mt-1">
              <LuSparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <Typography.Title
                level={3}
                className="font-semibold text-base! mb-0!"
              >
                AI RM Co-pilot
              </Typography.Title>
              <Typography.Paragraph
                type="secondary"
                className="text-xs! m-0! leading-none"
              >
                Always here to help
              </Typography.Paragraph>
            </div>
          </div>

          <Button
            shape="circle"
            icon={<LuX />}
            type="text"
            onClick={() => setCollapsed(true)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ChatMessage />
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input.TextArea
              placeholder="Ask me anything..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              value={messagesInput}
              onChange={(e) => setMessagesInput(e.target.value)}
              className="text-sm!"
            />
            <Button
              icon={<LuSend className="w-4 h-4" />}
              type="primary"
              className="w-9! h-9! min-w-9! rounded-lg!"
            />
          </div>
        </div>
      </div>

      <button
        className={cn(
          'fixed top-1/2 right-4 -translate-y-1/2',
          'h-24 sm:h-32 w-10 sm:w-12 hover:w-12 sm:hover:w-14 px-4 py-2',
          '[&_svg]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
          'flex flex-col items-center justify-center gap-2',
          'bg-primary bg-linear-to-b from-primary to-accent hover:bg-primary/90',
          'rounded-md rounded-l-2xl shadow-lg ',
          'text-sm font-medium',
          'disabled:pointer-events-none disabled:opacity-50',
          'ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'transition-all duration-200',
          'whitespace-nowrap focus-visible:outline-none z-10 cursor-pointer',
          collapsed ? 'opacity-100 visible' : 'opacity-0 invisible',
        )}
        onClick={() => setCollapsed(false)}
      >
        <LuSparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
        <span className="text-xs text-white font-semibold [writing-mode:vertical-rl] rotate-180">
          AI Agent
        </span>
      </button>
    </Layout.Sider>
  );
};

export default AgentChat;
