import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ChatWindow } from '../components/ChatWindow';
import { useChatStore } from '../store/useChatStore';

export const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { chats } = useChatStore();

  if (!id) {
    return <Navigate to="/" />;
  }

  const chatExists = chats.some(chat => chat.id === id);

  if (!chatExists && chats.length > 0) {
    return <Navigate to="/" />;
  }

  return <ChatWindow chatId={id} />;
};