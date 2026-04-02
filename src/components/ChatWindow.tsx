import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatStore } from '../store/useChatStore';
import { sendMessageToGigaChat } from '../api/gigachat';

const GIGACHAT_CLIENT_ID = process.env.REACT_APP_GIGACHAT_CLIENT_ID || '';
const GIGACHAT_SECRET = process.env.REACT_APP_GIGACHAT_SECRET || '';

interface ChatWindowProps {
  chatId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const { chats, addMessage, setLoading, isLoading, setCurrentChatId } = useChatStore();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find(c => c.id === chatId);
  const messages = currentChat?.messages || [];

  useEffect(() => {
    setCurrentChatId(chatId);
  }, [chatId, setCurrentChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentChat) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: inputMessage,
      timestamp: Date.now(),
    };

    addMessage(chatId, userMessage);
    setInputMessage('');
    setLoading(true);

    try {
      const apiMessages = [...currentChat.messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendMessageToGigaChat(apiMessages, GIGACHAT_CLIENT_ID, GIGACHAT_SECRET);

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: reply,
        timestamp: Date.now(),
      };

      addMessage(chatId, assistantMessage);
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentChat) {
    return <div className="empty-state">Чат не найден</div>;
  }

  return (
    <div className="chat-window">
      <div className="messages-area">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="loading">GigaChat печатает...</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder="Введите сообщение..."
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
          Отправить
        </button>
      </div>
    </div>
  );
};