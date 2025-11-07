'use client';

import { useGetTasksQuery } from '@/lib/api';
import { Button, Card, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { FC, useState } from 'react';
import { LuChevronsDown, LuChevronsUp } from 'react-icons/lu';
import TodoCard from './TodoCard';

const TodoList: FC = () => {
  const [showAll, setShowAll] = useState(false);

  const { data: tasks, refetch: refetchTasks } = useGetTasksQuery({
    rmId: 1,
  });

  const sortedTasks = tasks?.length
    ? [...tasks].sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'IN_PROGRESS' ? -1 : 1;
        }
        return dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf();
      })
    : [];

  const filteredData = sortedTasks?.length
    ? showAll
      ? sortedTasks
      : sortedTasks.slice(0, 3)
    : [];

  return (
    <div className="mb-10">
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

        {tasks?.length && tasks.length > 0 ? (
          <div>
            <Space direction="vertical" size={12} className="w-full">
              {filteredData.map((task) => (
                <TodoCard
                  key={task.id}
                  task={task}
                  refetchTasks={refetchTasks}
                />
              ))}
            </Space>

            {tasks?.length && tasks.length > 3 && (
              <div className="mt-4 text-center">
                <Button
                  type="link"
                  icon={showAll ? <LuChevronsUp /> : <LuChevronsDown />}
                  iconPosition="end"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll
                    ? 'See Less'
                    : `See More (${tasks?.length - 3} more)`}
                </Button>
              </div>
            )}
          </div>
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
