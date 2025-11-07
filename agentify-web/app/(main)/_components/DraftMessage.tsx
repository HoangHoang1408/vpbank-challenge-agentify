'use client';

import { SEGMENT_COLORS } from '@/constants';
import { IGenEmail, Segment } from '@/types';
import {
  Alert,
  Avatar,
  Button,
  Form,
  Input,
  Modal,
  Segmented,
  Tag,
  Typography,
} from 'antd';
import { FC, useEffect, useState } from 'react';
import {
  LuCircleCheck,
  LuCopy,
  LuMail,
  LuMessageCircle,
  LuRefreshCw,
  LuSend,
} from 'react-icons/lu';

const MESSAGE_TYPES = ['email', 'message'] as const;

interface FormValues {
  subject?: string;
  message: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  event: IGenEmail | null;
}

const DraftMessage: FC<Props> = ({ event, open, onClose }) => {
  const [form] = Form.useForm<FormValues>();

  const [messageType, setMessageType] =
    useState<(typeof MESSAGE_TYPES)[number]>('email');

  useEffect(() => {
    if (open && event) {
      if (messageType === 'email') {
        form.setFieldsValue({
          subject: event?.subject,
          message: event?.body,
        });
      } else if (messageType === 'message') {
        form.setFieldsValue({
          message: event?.message,
        });
      }
    }
  }, [messageType, event, open, form]);

  const handleCopyToClipboard = () => {
    if (messageType === 'email') {
      navigator.clipboard.writeText(
        `Subject: ${form.getFieldValue('subject')}\n\n\n${form.getFieldValue('message')}`,
      );
    } else if (messageType === 'message') {
      navigator.clipboard.writeText(form.getFieldValue('message'));
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={800}
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button key="regenerate" icon={<LuRefreshCw />} block>
            Regenerate
          </Button>
          <Button
            key="copy"
            icon={<LuCopy />}
            block
            variant="solid"
            color="cyan"
            onClick={handleCopyToClipboard}
          >
            Copy to Clipboard
          </Button>
          {messageType === 'email' ? (
            <Button key="send-email" icon={<LuSend />} block type="primary">
              Send Email
            </Button>
          ) : (
            <Button
              key="contacted"
              icon={<LuCircleCheck />}
              block
              type="primary"
            >
              Contacted
            </Button>
          )}
        </div>
      }
    >
      <div className="flex items-center gap-2">
        <Avatar size={40} className="bg-[#193876]! font-medium">
          {event?.customer?.name
            .split(' ')
            .map((name) => name[0])
            .slice(-2)
            .join('')}
        </Avatar>
        <div>
          <Typography.Title level={5} className="text-2xl! mb-0!">
            {event?.customer?.name}
          </Typography.Title>
          <div className="flex items-center gap-1 mt-1">
            <Tag className="rounded-xl! text-xs! font-medium">
              {event?.emailType.split('_').join(' ').toLowerCase()}
            </Tag>
            <Tag
              color={
                SEGMENT_COLORS[event?.customer?.segment as Segment] || 'default'
              }
              className="rounded-xl! text-xs! font-medium"
            >
              {event?.customer?.segment}
            </Tag>
          </div>
        </div>
      </div>

      <Segmented
        value={messageType}
        onChange={(value) =>
          setMessageType(value as (typeof MESSAGE_TYPES)[number])
        }
        options={[
          {
            label: (
              <div className="flex justify-center items-center gap-2">
                <LuMail />
                <span className="font-semibold">Email</span>
              </div>
            ),
            value: 'email',
          },
          {
            label: (
              <div className="flex justify-center items-center gap-2">
                <LuMessageCircle />
                <span className="font-semibold">Message</span>
              </div>
            ),
            value: 'message',
          },
        ]}
        block
        className="mt-8!"
      />

      <Form form={form} layout="vertical" className="mt-8!">
        {messageType === 'email' && (
          <Form.Item<FormValues>
            label={<span className="font-semibold">Subject</span>}
            name="subject"
          >
            <Input size="large" placeholder="Enter subject" />
          </Form.Item>
        )}
        <Form.Item<FormValues>
          label={<span className="font-semibold">Message</span>}
          name="message"
        >
          <Input.TextArea
            autoSize={{ minRows: 12, maxRows: 12 }}
            placeholder="Enter message"
          />
        </Form.Item>
      </Form>

      {messageType === 'message' && (
        <Alert
          message={
            <p>
              <span className="font-semibold">Compliance Note:</span> This
              message will be copied to your clipboard. Open Zalo manually to
              send it to maintain compliance with messaging policies.
            </p>
          }
          type="success"
          className="-mt-2! mb-4!"
        />
      )}
    </Modal>
  );
};

export default DraftMessage;
