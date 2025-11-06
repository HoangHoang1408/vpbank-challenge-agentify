'use client';

import { TONE_OPTIONS } from '@/constants';
import { cn } from '@/lib/utils';
import { Method, Step } from '@/types';
import { Button, Card, Input, Typography } from 'antd';
import { type FC } from 'react';
import { LuCircleCheck } from 'react-icons/lu';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface Props {
  method: Method | null;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  customTone: string;
  setCustomTone: (tone: string) => void;
  setStep: (step: Step) => void;
}

const ChooseTone: FC<Props> = ({
  method,
  selectedTone,
  setSelectedTone,
  customTone,
  setCustomTone,
  setStep,
}) => {
  return (
    <div className="space-y-6!">
      <Title level={4} className="text-xl">
        Step 2:{' '}
        {method === 'email'
          ? 'Fine-tune Your Tone'
          : 'Select Your Communication Style'}
      </Title>

      <div className="space-y-3!">
        {TONE_OPTIONS.map((option) => (
          <Card
            size="small"
            key={option.id}
            className={cn(
              'p-1! cursor-pointer transition-all border-2!',
              selectedTone === option.id
                ? 'border-primary! bg-primary/5!'
                : 'hover:border-primary/50!',
            )}
            onClick={() => setSelectedTone(option.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <Title level={4} className="font-medium text-base mb-0!">
                  {option.label}
                </Title>
                <Paragraph type="secondary" className="text-sm mb-0!">
                  {option.description}
                </Paragraph>
              </div>
              {selectedTone === option.id && (
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
        <TextArea
          className="border-2!"
          value={customTone}
          onChange={(e) => {
            setCustomTone(e.target.value);
            setSelectedTone('');
          }}
          placeholder="e.g., I prefer concise, direct communication with occasional humor and always personalize with the client's recent activities..."
          rows={4}
        />
      </div>

      <Button
        block
        type="primary"
        onClick={() => setStep('test')}
        disabled={!selectedTone && !customTone}
        className="text-white! disabled:text-[#00000040]!"
      >
        Continue to Test
      </Button>
    </div>
  );
};

export default ChooseTone;
