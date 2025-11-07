export type Tone = 'formal' | 'friendly' | 'balanced' | 'custom';

export interface ToneOption {
  id: Tone;
  label: string;
  description: string;
}
