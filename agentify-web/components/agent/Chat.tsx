import { cn } from '@/lib/utils';
import { Button, Input, Layout, Modal, Spin, Typography, message as antdMessage } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';
import { LuSend, LuSparkles, LuTrash2, LuX } from 'react-icons/lu';
import ChatMessage from './ChatMessage';
import { IChatMessage } from '@/types';
import { useClearChatHistoryMutation, useSendChatMessageMutation } from '@/lib/api';

const WELCOME_MESSAGE: IChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn với:

• Ưu tiên chiến lược - Tìm kiếm cơ hội khách hàng hàng đầu
• Hành động tiếp theo tốt nhất - Nhận đề xuất cá nhân hóa
• Báo cáo hiệu suất - Kiểm tra chỉ số của bạn ngay lập tức
• Nhập dữ liệu Task CRM - Ghi chép, cập nhật công việc

Tôi có thể hỗ trợ gì cho bạn hôm nay?`,
  timestamp: new Date(),
};

const AgentChat: FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [messagesInput, setMessagesInput] = useState<string>('');
  const [messages, setMessages] = useState<IChatMessage[]>([WELCOME_MESSAGE]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = useSendChatMessageMutation();
  const clearHistoryMutation = useClearChatHistoryMutation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messagesInput.trim() || sendMessageMutation.isPending) {
      return;
    }

    const userMessage: IChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messagesInput.trim(),
      timestamp: new Date(),
    };

    // Add user message to chat immediately
    setMessages((prev) => [...prev, userMessage]);
    setMessagesInput('');

    try {
      // Send message to API
      const response = await sendMessageMutation.mutateAsync({
        message: userMessage.content,
        rm_id: 1,
      });

      // Add assistant response to chat
      const assistantMessage: IChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      antdMessage.error('Không thể gửi tin nhắn. Vui lòng thử lại.');

      // Optionally remove the user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    Modal.confirm({
      title: 'Xóa lịch sử trò chuyện',
      content: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await clearHistoryMutation.mutateAsync(1); // rm_id = 1
          setMessages([WELCOME_MESSAGE]);
          antdMessage.success('Đã xóa lịch sử trò chuyện thành công');
        } catch (error) {
          console.error('Error clearing chat history:', error);
          antdMessage.error('Không thể xóa lịch sử trò chuyện. Vui lòng thử lại.');
        }
      },
    });
  };

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
                Luôn sẵn sàng hỗ trợ
              </Typography.Paragraph>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              shape="circle"
              icon={<LuTrash2 />}
              type="text"
              onClick={handleClearHistory}
              disabled={clearHistoryMutation.isPending}
              title="Xóa lịch sử trò chuyện"
            />
            <Button
              shape="circle"
              icon={<LuX />}
              type="text"
              onClick={() => setCollapsed(true)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ChatMessage messages={messages} />
          {sendMessageMutation.isPending && (
            <div className="flex justify-start mt-4">
              <div className="max-w-[85%] rounded-lg bg-[#eff2f5] p-3">
                <Spin size="small" />
                <span className="ml-2 text-gray-600">Đang suy nghĩ...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input.TextArea
              placeholder="Hỏi tôi bất cứ điều gì..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              value={messagesInput}
              onChange={(e) => setMessagesInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessageMutation.isPending}
              className="text-sm!"
            />
            <Button
              icon={<LuSend className="w-4 h-4" />}
              type="primary"
              onClick={handleSendMessage}
              disabled={!messagesInput.trim() || sendMessageMutation.isPending}
              loading={sendMessageMutation.isPending}
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
