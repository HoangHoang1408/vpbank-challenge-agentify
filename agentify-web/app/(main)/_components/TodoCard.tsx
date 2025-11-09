'use client';

import {
  useDeleteTaskMutation,
  useMarkTaskAsCompletedMutation,
  useMarkTaskAsInCompletedMutation,
} from '@/lib/api';
import { cn } from '@/lib/utils';
import { ITask } from '@/types';
import { App, Button, Card, Typography } from 'antd';
import dayjs from 'dayjs';
import { FC } from 'react';
import { FaSpinner } from 'react-icons/fa6';
import { LuCalendar, LuCheck, LuTrash2, LuUser } from 'react-icons/lu';

interface Props {
  task: ITask;
  refetchTasks: () => void;
}

const TodoCard: FC<Props> = ({ task, refetchTasks }) => {
  const { message, modal } = App.useApp();

  const { mutate: markTaskAsCompleted, isPending: isMarkingTaskAsCompleted } =
    useMarkTaskAsCompletedMutation();
  const {
    mutate: markTaskAsInCompleted,
    isPending: isMarkingTaskAsInCompleted,
  } = useMarkTaskAsInCompletedMutation();
  const { mutate: deleteTask, isPending: isDeletingTask } =
    useDeleteTaskMutation();

  const handleMarkTaskAsCompleted = () => {
    if (task.status === 'COMPLETED') {
      markTaskAsInCompleted(task.id, {
        onSuccess: () => {
          message.success('Task marked as incompleted');
          refetchTasks();
        },
        onError: (err) => {
          message.error(
            err.response?.data.message || 'Failed to mark task as completed',
          );
        },
      });
    } else {
      markTaskAsCompleted(task.id, {
        onSuccess: () => {
          message.success('Task marked as completed');
          refetchTasks();
        },
        onError: (err) => {
          message.error(
            err.response?.data.message || 'Failed to mark task as incompleted',
          );
        },
      });
    }
  };

  const handleDeleteTask = () => {
    modal.confirm({
      title: 'Delete Task',
      content:
        'Are you sure you want to delete this task? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        deleteTask(task.id, {
          onSuccess: () => {
            message.success('Task deleted successfully');
            refetchTasks();
          },
          onError: (err) => {
            message.error(
              err.response?.data.message || 'Failed to delete task',
            );
          },
        });
      },
    });
  };

  return (
    <Card size="small" className="w-full rounded-xl!">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Button
            loading={
              (isMarkingTaskAsCompleted || isMarkingTaskAsInCompleted) && {
                icon: <FaSpinner className="w-3.5 h-3.5" />,
              }
            }
            size="small"
            shape="circle"
            icon={
              task.status === 'COMPLETED' ? (
                <LuCheck className="w-3.5 h-3.5" />
              ) : null
            }
            variant={task.status === 'COMPLETED' ? 'solid' : 'outlined'}
            color="primary"
            className={cn(
              'w-4! min-w-4! h-4! p-0! mt-1.25! mb-auto!',
              task.status === 'COMPLETED' && 'cursor-default!',
            )}
            onClick={handleMarkTaskAsCompleted}
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
                  {task.taskType.split('_').join(' ').toLowerCase()}
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
          loading={isDeletingTask}
          onClick={handleDeleteTask}
        />
      </div>
    </Card>
  );
};

export default TodoCard;
