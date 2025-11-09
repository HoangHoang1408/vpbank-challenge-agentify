'use client';

import { useGetTasksQuery } from '@/lib/api';
import { TaskType } from '@/types/task.type';
import type { MenuProps } from 'antd';
import { Button, Card, Dropdown, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';
import { LuChevronDown, LuChevronsDown, LuChevronsUp } from 'react-icons/lu';
import TodoCard from './TodoCard';

const TodoList: FC = () => {
  const [showAll, setShowAll] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | 'all'>(
    'all',
  );

  const { data: tasks, refetch: refetchTasks } = useGetTasksQuery({
    rmId: 1,
  });

  useEffect(() => {
    setShowAll(false);
  }, [selectedTaskType]);

  const sortedTasks = tasks?.length
    ? (() => {
        const inProgressTasks = tasks.filter(
          (task) => task.status === 'IN_PROGRESS',
        );
        const completedTasks = tasks.filter(
          (task) => task.status === 'COMPLETED',
        );

        const sortedInProgress = inProgressTasks.sort(
          (a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf(),
        );
        const sortedCompleted = completedTasks.sort(
          (a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf(),
        );

        return [...sortedInProgress, ...sortedCompleted];
      })()
    : [];

  const taskTypeFilteredTasks =
    selectedTaskType === 'all'
      ? sortedTasks
      : sortedTasks.filter((task) => task.taskType === selectedTaskType);

  const filteredData = taskTypeFilteredTasks?.length
    ? showAll
      ? taskTypeFilteredTasks
      : taskTypeFilteredTasks.slice(0, 3)
    : [];

  const taskTypes: (TaskType | 'all')[] = [
    'all',
    'CALL',
    'EMAIL',
    'MEETING',
    'FOLLOW_UP',
    'SEND_INFO_PACKAGE',
  ];

  const getTaskTypeLabel = (type: TaskType | 'all') => {
    if (type === 'all') return 'Show All';
    return type.split('_').join(' ');
  };

  const menuItems: MenuProps['items'] = taskTypes.map((type) => ({
    key: type,
    label: (
      <Typography.Text className="capitalize">
        {getTaskTypeLabel(type).toLowerCase()}
      </Typography.Text>
    ),
  }));

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setSelectedTaskType(key as TaskType | 'all');
  };

  return (
    <div className="mb-10">
      <Card
        className="rounded-xl! w-full max-w-5xl mx-auto!"
        variant="borderless"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <Typography.Title level={2} className="text-3xl! mb-1!">
              Todo List
            </Typography.Title>
            <Typography.Text type="secondary">
              Talk to the AI Chief of Staff to add tasks to your list
            </Typography.Text>
          </div>
          <div>
            <Dropdown
              menu={{
                items: menuItems,
                onClick: handleMenuClick,
                selectable: true,
                selectedKeys: [selectedTaskType],
              }}
              trigger={['click']}
            >
              <Button icon={<LuChevronDown />} iconPosition="end">
                <span className="capitalize">
                  {getTaskTypeLabel(selectedTaskType).toLowerCase()}
                </span>
              </Button>
            </Dropdown>
          </div>
        </div>

        {tasks?.length && tasks.length > 0 ? (
          taskTypeFilteredTasks?.length && taskTypeFilteredTasks.length > 0 ? (
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

              {taskTypeFilteredTasks?.length &&
                taskTypeFilteredTasks.length > 3 && (
                  <div className="mt-4 text-center">
                    <Button
                      type="link"
                      icon={showAll ? <LuChevronsUp /> : <LuChevronsDown />}
                      iconPosition="end"
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll
                        ? 'See Less'
                        : `See More (${taskTypeFilteredTasks.length - 3} more)`}
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
                No tasks found for this filter. Try selecting a different task
                type.
              </Typography.Paragraph>
            </div>
          )
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
