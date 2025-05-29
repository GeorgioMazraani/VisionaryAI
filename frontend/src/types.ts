export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  image?: string;
  isError?: boolean;
}