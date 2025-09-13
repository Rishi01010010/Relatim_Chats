import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FiMessageCircle, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ChatListContainer = styled.div`
  padding: 1.5rem;
  background: transparent;
  color: var(--text-primary);
  height: 100%;
`;

const ChatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  background: ${props => props.active 
    ? 'rgba(99, 102, 241, 0.1)' 
    : 'rgba(38, 38, 38, 0.3)'};
  border: 1px solid ${props => props.active 
    ? 'var(--accent-primary)' 
    : 'var(--border-primary)'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: ${props => props.active 
      ? 'linear-gradient(180deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)' 
      : 'transparent'};
    transition: all var(--transition-normal);
  }

  &:hover {
    background: rgba(99, 102, 241, 0.05);
    border-color: var(--border-secondary);
    transform: translateX(4px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateX(2px) scale(0.98);
  }
`;

const ChatAvatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.3rem;
  margin-right: 1rem;
  flex-shrink: 0;
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 14px;
    height: 14px;
    background: var(--success);
    border: 2px solid var(--bg-secondary);
    border-radius: var(--radius-full);
  }
`;

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChatName = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
  font-size: 1rem;
`;

const LastMessage = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 400;
`;

const MessageTime = styled.div`
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin-left: auto;
  flex-shrink: 0;
  font-weight: 500;
`;

const UnreadBadge = styled.div`
  background: linear-gradient(135deg, var(--error) 0%, #dc2626 100%);
  color: var(--text-primary);
  border-radius: var(--radius-full);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.75rem;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  animation: pulse 2s infinite;
`;

const EmptyState = styled.div`
  text-align: center;
  color: var(--text-tertiary);
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  svg {
    opacity: 0.3;
    margin-bottom: 0.5rem;
  }

  div:last-child {
    font-size: 0.9rem;
    color: var(--text-muted);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  color: var(--text-tertiary);
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &::before {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-primary);
    border-top: 3px solid var(--accent-primary);
    border-radius: var(--radius-full);
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ChatList = ({ onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatUsers, setChatUsers] = useState({}); // Store user info for each chat
  const { user } = useAuth();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chats');
      const chatsData = response.data.chats;
      setChats(chatsData);
      
      // Fetch user info for chats that don't have it
      await fetchChatUsers(chatsData);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatUsers = async (chatsData) => {
    const usersToFetch = {};
    
    // Identify chats that need user info
    chatsData.forEach(chat => {
      if (chat.type === 'direct' && !chat.name && !chat.other_user && !chat.participants) {
        usersToFetch[chat.id] = chat;
      }
    });

    // If no chats need user info, return early
    if (Object.keys(usersToFetch).length === 0) {
      return;
    }

    // Try to get user info from contacts first
    try {
      const contactsResponse = await axios.get('/api/contacts');
      const contacts = contactsResponse.data.contacts || [];
      
      // For each chat that needs user info, try to match with contacts
      for (const [chatId, chat] of Object.entries(usersToFetch)) {
        // This is a fallback - we'll use a generic name for now
        // The real solution is to fix the backend to include user info in chat objects
        setChatUsers(prev => ({
          ...prev,
          [chatId]: { username: `User ${chatId}` }
        }));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      
      // Final fallback - use generic names
      for (const [chatId, chat] of Object.entries(usersToFetch)) {
        setChatUsers(prev => ({
          ...prev,
          [chatId]: { username: `User ${chatId}` }
        }));
      }
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getChatDisplayName = (chat) => {
    // Simple logic: Show the OTHER user's name, not your own
    const currentUsername = user?.username;
    const currentUserId = user?.id;

    console.log('Getting display name for chat:', chat);
    console.log('Current user:', { username: currentUsername, id: currentUserId });

    // For direct chats, prioritize participants if available
    if (chat.type === 'direct' && chat.participants && chat.participants.length > 0) {
      const otherUser = chat.participants.find(participant =>
        participant.username !== currentUsername && participant.id !== currentUserId
      );
      if (otherUser) {
        console.log('Found other user from participants:', otherUser.username);
        return otherUser.username;
      }
    }

    // For direct chats, check the server-provided name and other_user fields
    if (chat.type === 'direct') {
      // If chat has other_user field (JSON object from server)
      if (chat.other_user && chat.other_user.username) {
        console.log('Found other_user:', chat.other_user.username);
        return chat.other_user.username;
      }

      // If chat name is set (server sets this to other user's username for direct chats)
      if (chat.name && chat.name !== currentUsername) {
        console.log('Using chat name:', chat.name);
        return chat.name;
      }
    }



    // If chat has user1 and user2 fields (common in DB schema)
    if (chat.user1 && chat.user2) {
      console.log('Chat has user1 and user2:', chat.user1, chat.user2);
      if (chat.user1.username === currentUsername || chat.user1.id === currentUserId) {
        console.log('Current user is user1, returning user2:', chat.user2.username);
        return chat.user2.username;
      } else if (chat.user2.username === currentUsername || chat.user2.id === currentUserId) {
        console.log('Current user is user2, returning user1:', chat.user1.username);
        return chat.user1.username;
      }
    }

    // If chat has user_id and other_user_id fields
    if (chat.user_id && chat.other_user_id) {
      console.log('Chat has user_id and other_user_id:', chat.user_id, chat.other_user_id);
      if (chat.user_id === currentUserId) {
        // Current user is user_id, so show other_user
        if (chat.other_user) {
          return chat.other_user.username;
        }
      } else if (chat.other_user_id === currentUserId) {
        // Current user is other_user_id, so show user
        if (chat.user) {
          return chat.user.username;
        }
      }
    }

    // If chat has sender_id and receiver_id fields
    if (chat.sender_id && chat.receiver_id) {
      console.log('Chat has sender_id and receiver_id:', chat.sender_id, chat.receiver_id);
      if (chat.sender_id === currentUserId) {
        // Current user is sender, show receiver
        if (chat.receiver) {
          return chat.receiver.username;
        }
      } else if (chat.receiver_id === currentUserId) {
        // Current user is receiver, show sender
        if (chat.sender) {
          return chat.sender.username;
        }
      }
    }

    // If chat has recipient field
    if (chat.recipient) {
      console.log('Found recipient:', chat.recipient.username);
      return chat.recipient.username;
    }

    // Check for any field that might contain user information
    const possibleUserFields = ['user', 'contact', 'friend', 'member', 'participant'];
    for (const field of possibleUserFields) {
      if (chat[field] && chat[field].username && chat[field].username !== currentUsername) {
        console.log(`Found ${field}:`, chat[field].username);
        return chat[field].username;
      }
    }

    // If chat name is not the current user's name, use it (for group chats or other cases)
    if (chat.name && chat.name !== currentUsername) {
      console.log('Using chat name:', chat.name);
      return chat.name;
    }

    // Use fetched user information if available
    if (chatUsers[chat.id]) {
      console.log('Using fetched user info:', chatUsers[chat.id].username);
      return chatUsers[chat.id].username;
    }

    // For direct messages without user info, show generic name
    if (chat.type === 'direct' && !chat.name) {
      console.log('Using generic name for direct chat');
      return `User ${chat.id}`;
    }

    // Fallback
    console.log('Using fallback: Unknown Chat');
    return 'Unknown Chat';
  };

  const getChatDisplayAvatar = (chat) => {
    const displayName = getChatDisplayName(chat);
    return displayName.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <ChatListContainer>
        <LoadingState>Loading chats...</LoadingState>
      </ChatListContainer>
    );
  }

  if (chats.length === 0) {
    return (
      <ChatListContainer>
        <EmptyState>
          <FiMessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <div>No chats yet</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Start a conversation with your contacts
          </div>
        </EmptyState>
      </ChatListContainer>
    );
  }

  return (
    <ChatListContainer>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          active={selectedChatId === chat.id}
          onClick={() => onChatSelect(chat)}
        >
          <ChatAvatar>
            {getChatDisplayAvatar(chat)}
          </ChatAvatar>
          <ChatInfo>
            <ChatName>{getChatDisplayName(chat)}</ChatName>
            <LastMessage>
              {chat.last_message ? (
                <>
                  {chat.last_message}
                  <FiClock size={12} />
                </>
              ) : (
                'No messages yet'
              )}
            </LastMessage>
          </ChatInfo>
          <MessageTime>
            {formatTime(chat.last_message_time)}
          </MessageTime>
          {chat.unread_count > 0 && (
            <UnreadBadge>
              {chat.unread_count}
            </UnreadBadge>
          )}
        </ChatItem>
      ))}
    </ChatListContainer>
  );
};

export default ChatList;
