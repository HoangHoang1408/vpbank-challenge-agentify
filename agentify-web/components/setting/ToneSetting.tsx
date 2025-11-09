'use client';

import {
  useGetRMCustomPromptQuery,
  useUpdateRMCustomPromptMutation,
} from '@/lib/api';
import { App, Input, Modal, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ToneSetting: FC<Props> = ({ open, onClose }) => {
  const { message } = App.useApp();

  const { data: customPromptData, refetch: refetchCustomPrompt } =
    useGetRMCustomPromptQuery(1);
  const { mutate: updateRMCustomPrompt, isPending: isUpdatingCustomPrompt } =
    useUpdateRMCustomPromptMutation();

  const customPrompt = useMemo(
    () => customPromptData?.data?.customPrompt || '',
    [customPromptData],
  );

  const [customPromptValue, setCustomPromptValue] = useState(customPrompt);

  useEffect(() => {
    if (customPrompt && customPrompt !== customPromptValue) {
      setCustomPromptValue(customPrompt);
    }
  }, [customPrompt]);

  const handleSaveChange = () => {
    updateRMCustomPrompt(
      {
        id: 1,
        customPrompt: customPromptValue,
      },
      {
        onSuccess: () => {
          message.success('Custom prompt updated successfully');
          refetchCustomPrompt();
          onClose();
        },
        onError: () => {
          message.error('Failed to update custom prompt');
        },
      },
    );
    onClose();
  };

  const handleCancel = () => {
    setCustomPromptValue(customPrompt);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleSaveChange}
      okButtonProps={{
        disabled: customPromptValue === customPrompt,
        loading: isUpdatingCustomPrompt,
      }}
      okText="Save Change"
      title={
        <div className="flex items-center gap-2">
          <HiOutlineCog6Tooth className="w-5 h-5" />
          <Typography.Title level={2} className="text-lg! mb-0!">
            Update Custom Prompt
          </Typography.Title>
        </div>
      }
      width={800}
    >
      <div className="pt-4">
        <label className="text-sm font-medium mb-2 block">Custom Prompt</label>
        <Input.TextArea
          className="border-2!"
          value={customPromptValue}
          onChange={(e) => {
            setCustomPromptValue(e.target.value);
          }}
          placeholder="Enter your custom prompt..."
          rows={4}
        />
      </div>
    </Modal>
  );
};

export default ToneSetting;
