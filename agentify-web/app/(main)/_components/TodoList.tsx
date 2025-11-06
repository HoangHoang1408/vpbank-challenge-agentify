'use client';

import { cn } from '@/lib/utils';
import { Button, Card, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { FC } from 'react';
import { LuCalendar, LuCheck, LuTrash2, LuUser } from 'react-icons/lu';

interface ITodo {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
  category: string;
}

const mockData: ITodo[] = [
  {
    id: 1,
    title: 'Update project timeline',
    description:
      'Revise Gantt chart and notify stakeholders of schedule changes',
    isCompleted: true,
    createdAt: '2025-12-05',
    category: 'BuildTech Solutions',
  },
  {
    id: 2,
    title: 'Client onboarding call',
    description:
      'Introduction meeting with new client to discuss goals and expectations',
    isCompleted: false,
    createdAt: '2025-12-10',
    category: 'NextGen Startups',
  },
  {
    id: 3,
    title: 'Product demo preparation',
    description: 'Set up demo environment and prepare presentation materials',
    isCompleted: false,
    createdAt: '2025-12-15',
    category: 'Innovate Labs',
  },
  {
    id: 4,
    title: 'Annual contract renewal',
    description: 'Review terms and send renewal proposal to client',
    isCompleted: true,
    createdAt: '2025-12-20',
    category: 'Enterprise Solutions Inc',
  },
];

const TodoList: FC = () => {
  return (
    <div className="py-10">
      <Card
        className="rounded-xl! w-full max-w-5xl mx-auto!"
        variant="borderless"
      >
        <div className="mb-8">
          <Typography.Title level={2} className="text-3xl! mb-1!">
            Todo List
          </Typography.Title>
          <Typography.Text type="secondary">
            Talk to the AI Chief of Staff to add tasks to your list
          </Typography.Text>
        </div>

        {mockData.length > 0 ? (
          <Space direction="vertical" size={12} className="w-full">
            {mockData.map((todo) => (
              <Card key={todo.id} size="small" className="w-full rounded-xl!">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      shape="circle"
                      icon={
                        todo.isCompleted ? (
                          <LuCheck className="w-3.5 h-3.5" />
                        ) : null
                      }
                      variant={todo.isCompleted ? 'solid' : 'outlined'}
                      color="primary"
                      className="w-4! min-w-4! h-4! p-0! mt-1.25! mb-auto!"
                    />

                    <div>
                      <Typography.Title
                        level={3}
                        className={cn(
                          'font-semibold text-sm! sm:text-base! mb-1!',
                          todo.isCompleted &&
                            'line-through text-text-tertiary!',
                        )}
                      >
                        {todo.title}
                      </Typography.Title>
                      <Typography.Text
                        type="secondary"
                        className={cn(
                          'text-xs! sm:text-sm! mb-2!',
                          todo.isCompleted && 'line-through',
                        )}
                      >
                        {todo.description}
                      </Typography.Text>

                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <LuUser className="w-3 h-3 text-text-tertiary!" />
                          <Typography.Text
                            type="secondary"
                            className="text-xs! mb-0.25!"
                          >
                            {todo.category}
                          </Typography.Text>
                        </div>
                        <div className="flex items-center gap-1">
                          <LuCalendar className="w-3 h-3 text-text-tertiary!" />
                          <Typography.Text
                            type="secondary"
                            className="text-xs! mb-0.25!"
                          >
                            {dayjs(todo.createdAt).format('DD/MM/YYYY')}
                          </Typography.Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    shape="circle"
                    icon={<LuTrash2 />}
                    type="text"
                    danger
                  />
                </div>
              </Card>
            ))}
          </Space>
        ) : (
          <div className="mt-12 mb-8">
            <Typography.Paragraph
              type="secondary"
              className="text-sm! text-center"
            >
              No tasks yet. Chat with the AI to create your first task!
            </Typography.Paragraph>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TodoList;
