import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatStore, Chat, Message } from '../types';

const generateId = () => crypto.randomUUID();

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      isLoading: false,
      error: null,

      createChat: (firstMessage?: string) => {
        const newId = generateId();
        const title = firstMessage
          ? firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '')
          : 'Новый чат';
        const newChat: Chat = {
          id: newId,
          title,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: firstMessage ? [{
            id: generateId(),
            role: 'user',
            content: firstMessage,
            timestamp: Date.now()
          }] : [],
        };
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newId,
        }));
        return newId;
      },

      updateChatTitle: (id, title) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, title, updatedAt: Date.now() } : chat
          ),
        }));
      },

      deleteChat: (id) => {
        set((state) => {
          const newChats = state.chats.filter((chat) => chat.id !== id);
          let newCurrentId = state.currentChatId;
          if (state.currentChatId === id) {
            newCurrentId = newChats.length > 0 ? newChats[0].id : null;
          }
          return { chats: newChats, currentChatId: newCurrentId };
        });
      },

      setCurrentChatId: (id) => set({ currentChatId: id }),

      addMessage: (chatId, message) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  updatedAt: Date.now(),
                }
              : chat
          ),
        }));
      },

      updateLastMessage: (chatId, content) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId && chat.messages.length > 0
              ? {
                  ...chat,
                  messages: chat.messages.map((msg, idx) =>
                    idx === chat.messages.length - 1 ? { ...msg, content } : msg
                  ),
                  updatedAt: Date.now(),
                }
              : chat
          ),
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error: error }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
      }),
    }
  )
);