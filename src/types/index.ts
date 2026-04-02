export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
  createChat: (firstMessage?: string) => string;
  updateChatTitle: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  setCurrentChatId: (id: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateLastMessage: (chatId: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}