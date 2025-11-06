export type Tone = 'formal' | 'friendly' | 'balanced' | 'custom';

export interface ToneOption {
  label: string;
  description: string;
}

export type ToneOptions = Partial<Record<Tone, ToneOption>>;
