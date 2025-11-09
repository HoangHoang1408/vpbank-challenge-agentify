'use client';

import {
  useGetRMEmailSignatureQuery,
  useUpdateRMEmailSignatureMutation,
} from '@/lib/api';
import { App, Input, Modal, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';
import { LuSignature } from 'react-icons/lu';

interface Props {
  open: boolean;
  onClose: () => void;
}

const EmailSignatureSetting: FC<Props> = ({ open, onClose }) => {
  const { message } = App.useApp();

  const { data: emailSignatureData, refetch: refetchEmailSignature } =
    useGetRMEmailSignatureQuery(1);
  const {
    mutate: updateRMEmailSignature,
    isPending: isUpdatingEmailSignature,
  } = useUpdateRMEmailSignatureMutation();

  const emailSignature = useMemo(
    () => emailSignatureData?.data?.emailSignature || '',
    [emailSignatureData],
  );

  const [signatureValue, setSignatureValue] = useState(emailSignature);

  useEffect(() => {
    if (emailSignature && emailSignature !== signatureValue) {
      setSignatureValue(emailSignature);
    }
  }, [emailSignature]);

  const handleSaveChange = () => {
    updateRMEmailSignature(
      { id: 1, emailSignature: signatureValue },
      {
        onSuccess: () => {
          message.success('Email signature updated successfully');
          refetchEmailSignature();
          onClose();
        },
        onError: () => {
          message.error('Failed to update email signature');
        },
      },
    );
  };

  const handleCancel = () => {
    setSignatureValue(emailSignature);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleSaveChange}
      okText="Save Change"
      okButtonProps={{
        disabled: signatureValue === emailSignature,
        loading: isUpdatingEmailSignature,
      }}
      title={
        <div className="flex items-center gap-2">
          <LuSignature className="w-5 h-5" />
          <Typography.Title level={2} className="text-lg! mb-0!">
            Update Email Signature
          </Typography.Title>
        </div>
      }
      width={800}
    >
      <div className="pt-4">
        <label className="text-sm font-medium mb-2 block">
          Email Signature
        </label>
        <Input.TextArea
          className="border-2!"
          value={signatureValue}
          onChange={(e) => {
            setSignatureValue(e.target.value);
          }}
          placeholder={'Best regards,\nYour Name\nYour Title\nYour Company'}
          rows={4}
        />
      </div>
    </Modal>
  );
};

export default EmailSignatureSetting;
