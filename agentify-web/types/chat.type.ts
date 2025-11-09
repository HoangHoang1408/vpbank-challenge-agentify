export interface IChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface IChatRequest {
  message: string;
  rm_id: number;
}

export interface IChatResponse {
  message: string;
}

