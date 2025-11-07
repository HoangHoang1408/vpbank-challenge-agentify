'use client';

import { useGetTasksQuery } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button, Card, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { FC, useState } from 'react';
import {
  LuCalendar,
  LuCheck,
  LuChevronsDown,
  LuChevronsUp,
  LuTrash2,
  LuUser,
} from 'react-icons/lu';

const TodoList: FC = () => {
  const [showAll, setShowAll] = useState(false);

  const { data: tasks } = useGetTasksQuery({
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
                <Card key={task.id} size="small" className="w-full rounded-xl!">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        shape="circle"
                        icon={
                          task.status === 'COMPLETED' ? (
                            <LuCheck className="w-3.5 h-3.5" />
                          ) : null
                        }
                        variant={
                          task.status === 'COMPLETED' ? 'solid' : 'outlined'
                        }
                        color="primary"
                        className="w-4! min-w-4! h-4! p-0! mt-1.25! mb-auto!"
                      />

                      <div>
                        <Typography.Title
                          level={3}
                          className={cn(
                            'font-semibold text-sm! sm:text-base! mb-1!',
                            task.status === 'COMPLETED' &&
                              'line-through text-text-tertiary!',
                          )}
                        >
                          {task.taskDetails}
                        </Typography.Title>
                        <Typography.Text
                          type="secondary"
                          className={cn(
                            'text-xs! sm:text-sm! mb-2!',
                            task.status === 'COMPLETED' && 'line-through',
                          )}
                        >
                          {task.taskDetails}
                        </Typography.Text>

                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <LuUser className="w-3 h-3 text-text-tertiary!" />
                            <Typography.Text
                              type="secondary"
                              className="text-xs! mb-0.25! capitalize"
                            >
                              {task.taskType.toLowerCase()}
                            </Typography.Text>
                          </div>
                          <div className="flex items-center gap-1">
                            <LuCalendar className="w-3 h-3 text-text-tertiary!" />
                            <Typography.Text
                              type="secondary"
                              className={cn(
                                'text-xs! mb-0.25!',
                                dayjs(task.dueDate).isBefore(dayjs(), 'day') &&
                                  'text-red-500!',
                              )}
                            >
                              {dayjs(task.dueDate).format('DD/MM/YYYY')}
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
