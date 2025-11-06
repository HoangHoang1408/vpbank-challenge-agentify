'use client';

import { TONE_OPTIONS } from '@/constants';
import { cn } from '@/lib/utils';
import { useSettingStore } from '@/stores';
import { ToneOption } from '@/types';
import { Card, Input, Modal, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { LuCircleCheck } from 'react-icons/lu';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ToneSetting: FC<Props> = ({ open, onClose }) => {
  const { tone, setTone } = useSettingStore();

  const [selectedTone, setSelectedTone] = useState<ToneOption | null>(tone);
  const [customTone, setCustomTone] = useState('');

  useEffect(() => {
    if (tone && tone.id !== selectedTone?.id) {
      setSelectedTone(tone);
    }
  }, [tone]);

  const handleSaveChanges = () => {
    if (selectedTone) {
      setTone(selectedTone);
    }
    onClose();
  };

  const handleCancel = () => {
    setSelectedTone(tone);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleSaveChanges}
      okText="Save Changes"
      okButtonProps={{
        disabled: selectedTone?.id === tone?.id,
      }}
      title={
        <div className="flex items-center gap-2">
          <HiOutlineCog6Tooth className="w-5 h-5" />
          <Typography.Title level={2} className="text-lg! mb-0!">
            Update Communication Tone
          </Typography.Title>
        </div>
      }
      width={700}
    >
      <div className="space-y-3! mt-8">
        {TONE_OPTIONS.map((tone) => (
          <Card
            size="small"
            key={tone.id}
            className={cn(
              'p-1! cursor-pointer transition-all border-2!',
              selectedTone?.id === tone.id
                ? 'border-primary! bg-primary/5!'
                : 'hover:border-primary/50!',
            )}
            onClick={() => {
              setSelectedTone(tone);
              setCustomTone(tone.description);
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Typography.Title level={4} className="text-base! mb-0!">
                  {tone.label}
                </Typography.Title>
                <Typography.Paragraph
                  type="secondary"
                  className="text-sm! mb-0!"
                >
                  {tone.description}
                </Typography.Paragraph>
              </div>
              {selectedTone?.id === tone.id && (
                <LuCircleCheck className="w-5 h-5 text-primary" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <label className="text-sm font-medium mb-2 block">
          Or describe your own communication style:
        </label>
        <Input.TextArea
          className="border-2!"
          value={customTone}
          onChange={(e) => {
            setCustomTone(e.target.value);
            setSelectedTone({
              id: 'custom',
              label: 'Custom',
              description: e.target.value,
            });
          }}
          placeholder="Describe your preferred communication style..."
          rows={4}
        />
      </div>
    </Modal>
  );
};

export default ToneSetting;
