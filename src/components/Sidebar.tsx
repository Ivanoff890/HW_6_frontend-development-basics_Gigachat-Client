import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';

export const Sidebar: React.FC = () => {
  const { chats, createChat, updateChatTitle, deleteChat, setCurrentChatId } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();

  const filteredChats = chats.filter(chat => {
    const query = searchQuery.toLowerCase();
    const titleMatch = chat.title.toLowerCase().includes(query);
    const lastMessage = chat.messages[chat.messages.length - 1]?.content || '';
    const messageMatch = lastMessage.toLowerCase().includes(query);
    return titleMatch || messageMatch;
  });

  const handleCreateChat = () => {
    const newId = createChat();
    navigate(`/chat/${newId}`);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Удалить этот чат?')) {
      deleteChat(id);
      navigate('/');
    }
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    navigate(`/chat/${id}`);
  };

  const startEditing = (chat: { id: string; title: string }, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const saveEditing = (id: string) => {
    if (editTitle.trim()) {
      updateChatTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const getLastMessagePreview = (chat: typeof chats[0]) => {
    if (chat.messages.length === 0) return 'Нет сообщений';
    const lastMsg = chat.messages[chat.messages.length - 1].content;
    return lastMsg.length > 50 ? lastMsg.slice(0, 50) + '...' : lastMsg;
  };

  return (
    <div className="sidebar">
      <button onClick={handleCreateChat} className="new-chat-btn">
        + Новый чат
      </button>
      <input
        type="text"
        placeholder="Поиск по чатам..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      <div className="chats-list">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${chat.id === useChatStore.getState().currentChatId ? 'active' : ''}`}
            onClick={() => handleSelectChat(chat.id)}
          >
            <div className="chat-info">
              {editingId === chat.id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => saveEditing(chat.id)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditing(chat.id)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="edit-input"
                />
              ) : (
                <span className="chat-title">{chat.title}</span>
              )}
              <div className="chat-actions">
                <button
                  onClick={(e) => startEditing(chat, e)}
                  className="edit-btn"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="delete-btn"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="chat-preview">{getLastMessagePreview(chat)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};