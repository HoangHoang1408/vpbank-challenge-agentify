import { Step } from '@/types';
import { Button, Card, Input, Typography } from 'antd';
import { FC, useState } from 'react';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface Props {
  setStep: (step: Step) => void;
  handleComplete: () => void;
}

const TestAssistant: FC<Props> = ({ setStep, handleComplete }) => {
  const [testMessage, setTestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  return (
    <div className="space-y-6!">
      <Title level={4} className="text-xl">
        Step 3: Test Your AI Assistant
      </Title>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Try asking your AI assistant something:
        </label>
        <TextArea
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="e.g., Draft a birthday message for a client..."
          rows={3}
        />
      </div>

      <Button
        block
        variant="solid"
        color="cyan"
        loading={isLoading}
        className="text-white! disabled:text-[#00000040]!"
      >
        {isLoading ? 'Generating...' : 'Test AI Response'}
      </Button>

      {aiResponse && (
        <Card size="small">
          <Paragraph className="text-sm font-medium mb-2!">
            AI Response:
          </Paragraph>
          <Paragraph className="text-sm whitespace-pre-wrap">
            {aiResponse}
          </Paragraph>
        </Card>
      )}

      <div className="flex gap-3 pt-4">
        <Button block onClick={() => setStep('tone')}>
          Back to Tone
        </Button>
        <Button
          block
          type="primary"
          onClick={handleComplete}
          className="text-white! disabled:text-[#00000040]!"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
};

export default TestAssistant;
