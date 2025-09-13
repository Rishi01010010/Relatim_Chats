import React, { useState } from 'react';
import styled from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Sidebar from './components/Layout/Sidebar';
import ChatList from './components/Chat/ChatList';
import ChatWindow from './components/Chat/ChatWindow';
import ContactList from './components/Contacts/ContactList';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: var(--bg-secondary);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 10% 20%, var(--accent-primary) 0%, transparent 30%),
                radial-gradient(circle at 90% 80%, var(--accent-secondary) 0%, transparent 30%);
    opacity: 0.05;
    pointer-events: none;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  z-index: 1;
`;

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedChat, setSelectedChat] = useState(null);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        color: 'var(--text-primary)',
        position: 'relative'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '3px solid var(--border-primary)',
          borderTop: '3px solid var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <div style={{
          fontSize: '1.2rem',
          fontWeight: '500',
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Loading Relatim Chats...
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {authMode === 'login' ? (
          <Login onToggleMode={() => setAuthMode('register')} />
        ) : (
          <Register onToggleMode={() => setAuthMode('login')} />
        )}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(26, 26, 26, 0.95)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'var(--shadow-lg)',
              fontSize: '0.95rem',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: 'var(--text-primary)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--error)',
                secondary: 'var(--text-primary)',
              },
            },
          }}
        />
      </>
    );
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'chat') {
      setSelectedChat(null);
    }
  };

  const handleChatSelect = (chat) => {
    console.log('Chat selected:', chat);
    setSelectedChat(chat);
    setActiveTab('chat');
  };

  const renderSidebarContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <ChatList
            onChatSelect={handleChatSelect}
            selectedChatId={selectedChat?.id}
          />
        );
      case 'contacts':
        return (
          <ContactList
            onStartChat={handleChatSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppContainer>
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {renderSidebarContent()}
      </Sidebar>
      
      <MainContent>
        <ChatWindow selectedChat={selectedChat} />
      </MainContent>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(26, 26, 26, 0.95)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '0.95rem',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: 'var(--success)',
              secondary: 'var(--text-primary)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--error)',
              secondary: 'var(--text-primary)',
            },
          },
        }}
      />
    </AppContainer>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
