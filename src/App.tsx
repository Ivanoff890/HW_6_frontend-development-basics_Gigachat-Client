import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ChatPage } from './pages/ChatPage';
import { useChatStore } from './store/useChatStore';
import './App.css';

function App() {
  const { chats, createChat } = useChatStore();

  useEffect(() => {
    if (chats.length === 0) {
      createChat();
    }
  }, [chats.length, createChat]);

  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={
              chats.length > 0
                ? <Navigate to={`/chat/${chats[0].id}`} />
                : <div className="empty-state">Создайте новый чат</div>
            } />
            <Route path="/chat/:id" element={<ChatPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;