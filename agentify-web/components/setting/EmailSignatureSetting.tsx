'use client';

import { useSettingStore } from '@/stores';
import { Input, Modal, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import { LuSignature } from 'react-icons/lu';

interface Props {
  open: boolean;
  onClose: () => void;
}

const EmailSignatureSetting: FC<Props> = ({ open, onClose }) => {
  const { emailSignature, setEmailSignature } = useSettingStore();

  const [signatureValue, setSignatureValue] = useState(emailSignature);

  useEffect(() => {
    if (emailSignature && emailSignature !== signatureValue) {
      setSignatureValue(emailSignature);
    }
  }, [emailSignature]);

  const handleSaveChange = () => {
    setEmailSignature(signatureValue);
    onClose();
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
