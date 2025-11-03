'use client';

import { Card, Space, Typography } from 'antd';
import { useState, type FC } from 'react';
import { LuMail, LuMessageSquare } from 'react-icons/lu';

const { Title, Paragraph } = Typography;

type Step = 'method' | 'tone' | 'test';
type Method = 'email' | 'tone';

const Onboarding: FC = () => {
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<Method | null>(null);

  const handleMethodSelect = (selectedMethod: Method) => {
    setMethod(selectedMethod);
    setStep('tone');
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="shadow-sm w-full max-w-2xl">
        <div className="mb-8">
          <Title level={2} className="mb-2! text-3xl">
            Welcome to RM Co-Pilot
          </Title>
          <Paragraph type="secondary">
            Let's personalize your AI assistant in 3 quick steps
          </Paragraph>
        </div>

        {step === 'method' && (
          <div>
            <Title level={4} className="text-xl mb-4!">
              Step 1: Choose Setup Method
            </Title>

            <Space direction="vertical" className="gap-4 w-full">
              <Card
                className="border-2 hover:border-primary transition-[border-color] duration-300 cursor-pointer"
                onClick={() => handleMethodSelect('email')}
              >
                <div className="flex gap-4">
                  <LuMail size={32} />
                  <div>
                    <Title level={4} className="mb-1!">
                      Connect Email
                    </Title>
                    <Paragraph type="secondary" className="mb-0!">
                      Let the AI learn your communication style from your sent
                      emails
                    </Paragraph>
                  </div>
                </div>
              </Card>

              <Card
                className="border-2 hover:border-primary transition-[border-color] duration-300 cursor-pointer"
                onClick={() => handleMethodSelect('tone')}
              >
                <div className="flex gap-4">
                  <LuMessageSquare size={32} className="text-cyan-500" />
                  <div>
                    <Title level={4} className="mb-1!">
                      Choose Communication Tone
                    </Title>
                    <Paragraph type="secondary" className="mb-0!">
                      Select from preset tones or describe your own style
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Onboarding;
