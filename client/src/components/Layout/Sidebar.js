import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMessageCircle, FiUsers, FiPlus, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const SidebarContainer = styled.div`
  width: 320px;
  height: 100vh;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  color: var(--text-primary);
  transition: all var(--transition-normal);
  position: relative;
  z-index: 10;
  box-shadow: var(--shadow-lg);
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(38, 38, 38, 0.5);
  backdrop-filter: blur(10px);
`;

const AppTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(38, 38, 38, 0.3);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);

  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-lg);
  }
`;

const UserName = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
`;

const LogoutButton = styled.button`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--error);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: var(--error);
    transform: translateY(-1px);
  }
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-primary);
  background: rgba(38, 38, 38, 0.3);
`;

const Tab = styled.button`
  flex: 1;
  padding: 1.25rem 1rem;
  background: ${props => props.active ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};
  border: none;
  color: ${props => props.active ? 'var(--accent-primary)' : 'var(--text-secondary)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all var(--transition-normal);
  font-weight: 500;
  position: relative;
  border-bottom: 2px solid ${props => props.active ? 'var(--accent-primary)' : 'transparent'};

  &:hover {
    background: rgba(99, 102, 241, 0.05);
    color: var(--text-primary);
    transform: translateY(-1px);
  }

  svg {
    transition: all var(--transition-normal);
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  background: rgba(26, 26, 26, 0.3);
`;

const AddButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border: none;
  color: var(--text-primary);
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  z-index: 20;

  &:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Sidebar = ({ activeTab, onTabChange, children }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarContainer>
      <Header>
        <AppTitle>Relatim Chats</AppTitle>
        <UserSection>
          <UserInfo>
            <Avatar>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <UserName>{user?.username}</UserName>
          </UserInfo>
          <LogoutButton onClick={handleLogout} title="Logout">
            <FiLogOut />
          </LogoutButton>
        </UserSection>
      </Header>
      
      <Tabs>
        <Tab 
          active={activeTab === 'chat'} 
          onClick={() => onTabChange('chat')}
        >
          <FiMessageCircle />
          Chat
        </Tab>
        <Tab 
          active={activeTab === 'contacts'} 
          onClick={() => onTabChange('contacts')}
        >
          <FiUsers />
          Contacts
        </Tab>
      </Tabs>

      <Content>
        {children}
      </Content>
    </SidebarContainer>
  );
};

export default Sidebar;
