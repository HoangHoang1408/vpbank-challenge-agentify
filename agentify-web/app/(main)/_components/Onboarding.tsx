'use client';

import { Method, Step } from '@/types';
import { Card, Typography } from 'antd';
import { useState, type FC } from 'react';
import ChooseMethod from './ChooseMethod';
import ChooseTone from './ChooseTone';
import TestAssistant from './TestAssistant';

const { Title, Paragraph } = Typography;

const Onboarding: FC = () => {
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<Method | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [customTone, setCustomTone] = useState('');

  const handleMethodSelect = (selectedMethod: Method) => {
    setMethod(selectedMethod);
    setStep('tone');
  };

  const handleComplete = () => {
    // const finalTone =
    //   customTone ||
    //   TONE_OPTIONS.find((t) => t.id === selectedTone)?.description ||
    //   '';
    // onComplete({ method: method || "tone", tone: finalTone });
    // toast.success("Setup complete! Welcome to your RM Co-Pilot.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="shadow-sm w-full max-w-2xl">
        <div className="mb-8">
          <Title level={2} className="mb-2! text-3xl font-bold!">
            Welcome to RM Co-Pilot
          </Title>
          <Paragraph type="secondary">
            Let's personalize your AI assistant in 3 quick steps
          </Paragraph>
        </div>

        {step === 'method' && (
          <ChooseMethod handleMethodSelect={handleMethodSelect} />
        )}

        {step === 'tone' && (
          <ChooseTone
            method={method}
            selectedTone={selectedTone}
            setSelectedTone={setSelectedTone}
            customTone={customTone}
            setCustomTone={setCustomTone}
            setStep={setStep}
          />
        )}

        {step === 'test' && (
          <TestAssistant setStep={setStep} handleComplete={handleComplete} />
        )}
      </Card>
    </div>
  );
};

export default Onboarding;
