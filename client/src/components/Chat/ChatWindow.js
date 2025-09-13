import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiSend, FiSmile } from 'react-icons/fi';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-secondary);
  color: var(--text-primary);
  position: relative;
`;

const ChatHeader = styled.div`
  background: rgba(38, 38, 38, 0.95);
  backdrop-filter: blur(20px);
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
`;

const ChatAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.2rem;
  box-shadow: var(--shadow-md);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    background: var(--success);
    border: 2px solid var(--bg-secondary);
    border-radius: var(--radius-full);
  }
`;

const ChatInfo = styled.div`
  flex: 1;
`;

const ChatName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
`;

const ChatStatus = styled.div`
  font-size: 0.9rem;
  color: var(--success);
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: var(--success);
    border-radius: var(--radius-full);
    animation: pulse 2s infinite;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
`;

const Message = styled.div`
  display: flex;
  justify-content: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  margin-bottom: 0.5rem;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 1rem 1.25rem;
  border-radius: ${props => props.isOwn ? 'var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)' : 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)'};
  background: ${props => props.isOwn 
    ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)' 
    : 'var(--bg-quaternary)'};
  color: ${props => props.isOwn ? 'var(--text-primary)' : 'var(--text-primary)'};
  box-shadow: var(--shadow-md);
  word-wrap: break-word;
  border: 1px solid ${props => props.isOwn ? 'transparent' : 'var(--border-primary)'};
  position: relative;
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: ${props => props.isOwn ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-tertiary)'};
  margin-top: 0.5rem;
  text-align: ${props => props.isOwn ? 'right' : 'left'};
  font-weight: 400;
`;

const MessageInput = styled.div`
  background: rgba(38, 38, 38, 0.95);
  backdrop-filter: blur(20px);
  padding: 1.5rem;
  border-top: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
`;

const Input = styled.input`
  flex: 1;
  padding: 1rem 1.25rem;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-full);
  outline: none;
  font-size: 1rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: all var(--transition-normal);
  font-weight: 500;

  &::placeholder {
    color: var(--text-tertiary);
    font-weight: 400;
  }

  &:focus {
    border-color: var(--accent-primary);
    background: var(--bg-quaternary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:hover:not(:focus) {
    border-color: var(--border-secondary);
    background: var(--bg-quaternary);
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border: none;
  color: var(--text-primary);
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left var(--transition-slow);
  }

  &:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: var(--shadow-lg);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    background: var(--text-muted);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    
    &::before {
      display: none;
    }
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 1.2rem;
  text-align: center;
  padding: 2rem;
  gap: 1rem;

  &::before {
    content: '💬';
    font-size: 4rem;
    opacity: 0.5;
  }
`;

const TypingIndicator = styled.div`
  color: var(--text-tertiary);
  font-style: italic;
  font-size: 0.9rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-quaternary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::after {
    content: '';
    width: 4px;
    height: 4px;
    background: var(--accent-primary);
    border-radius: var(--radius-full);
    animation: typing 1.4s infinite;
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }
`;

const ChatWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [chatUser, setChatUser] = useState(null); // Store the other user's info
  const messagesEndRef = useRef(null);
  const { sendMessage, startTyping, stopTyping, socket } = useSocket();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedChat && user) {
      // Add a small delay to ensure authentication is fully set up
      const timer = setTimeout(() => {
        fetchMessages();
        fetchChatUser();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [selectedChat, user]);

  const fetchChatUser = async () => {
    if (!selectedChat || !user) return;

    // If we already have user info in the chat object, use it
    if (selectedChat.other_user || selectedChat.participants || selectedChat.user1 || selectedChat.user2) {
      return;
    }

    // Since the backend doesn't have user endpoints, use a fallback
    // The real solution is to fix the backend to include user info in chat objects
    setChatUser({ username: `User ${selectedChat.id}` });
  };

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (data) => {
        console.log('Received new_message:', data);
        console.log('Current selectedChat ID:', selectedChat?.id);
        console.log('Message chat ID:', data.chatId);
        if (data.chatId === selectedChat?.id) {
          setMessages(prev => {
            // Replace temp message if exists
            const tempIndex = prev.findIndex(m => m.isTemp && m.content === data.message.content && m.sender_id === data.message.sender_id);
            if (tempIndex !== -1) {
              const newMessages = [...prev];
              newMessages[tempIndex] = data.message;
              return newMessages;
            }
            // Avoid duplicates
            const exists = prev.find(m => m.id === data.message.id);
            if (!exists) {
              return [...prev, data.message];
            }
            return prev;
          });
        }
      });

      socket.on('message_sent', (data) => {
        console.log('Message sent confirmation:', data);
        // Optionally update the message if needed
      });

      socket.on('message_error', (data) => {
        console.error('Message send error:', data);
        alert('Failed to send message: ' + data.error);
      });

      socket.on('user_typing', (data) => {
        if (data.chatId === selectedChat?.id) {
          setTypingUsers(prev => {
            if (!prev.find(u => u.userId === data.userId)) {
              return [...prev, { userId: data.userId, username: data.username }];
            }
            return prev;
          });
        }
      });

      socket.on('user_stopped_typing', (data) => {
        if (data.chatId === selectedChat?.id) {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }
      });

      return () => {
        socket.off('new_message');
        socket.off('message_sent');
        socket.off('message_error');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
      };
    }
  }, [socket, selectedChat]);

  const fetchMessages = async () => {
    if (!selectedChat || !user) return;

    setLoading(true);
    try {
      console.log('Fetching messages for chat:', selectedChat.id);
      
      // Ensure we have a valid token before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`/api/messages/${selectedChat.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Messages response:', response.data);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Handle specific authentication errors
      if (error.response?.status === 401 || error.message.includes('token')) {
        console.error('Authentication error - token may be invalid');
        // Don't show alert for auth errors, just log them
        setMessages([]);
      } else {
        // Show error message to user for other errors
        alert('Failed to load messages: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const messageContent = newMessage.trim();
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      sender_id: user?.id,
      created_at: new Date().toISOString(),
      sender_username: user?.username,
      isTemp: true
    };

    console.log('Sending message:', messageContent, 'to chat:', selectedChat.id);
    console.log('Socket connected:', socket?.connected);

    // Optimistically add the message
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    sendMessage(selectedChat.id, messageContent);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (selectedChat) {
      if (e.target.value.trim()) {
        startTyping(selectedChat.id);
      } else {
        stopTyping(selectedChat.id);
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getChatDisplayName = (chat) => {
    // Simple logic: Show the OTHER user's name, not your own
    const currentUsername = user?.username;
    const currentUserId = user?.id;
    
    // If chat has participants array, find the other user
    if (chat.participants && chat.participants.length > 0) {
      const otherUser = chat.participants.find(participant => 
        participant.username !== currentUsername && participant.id !== currentUserId
      );
      if (otherUser) {
        return otherUser.username;
      }
    }
    
    // If chat has user1 and user2 fields (common in DB schema)
    if (chat.user1 && chat.user2) {
      if (chat.user1.username === currentUsername || chat.user1.id === currentUserId) {
        return chat.user2.username;
      } else if (chat.user2.username === currentUsername || chat.user2.id === currentUserId) {
        return chat.user1.username;
      }
    }
    
    // If chat has user_id and other_user_id fields
    if (chat.user_id && chat.other_user_id) {
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
    
    // If chat has other_user field
    if (chat.other_user) {
      return chat.other_user.username;
    }
    
    // If chat has recipient field
    if (chat.recipient) {
      return chat.recipient.username;
    }
    
    // If chat has sender and receiver fields
    if (chat.sender && chat.receiver) {
      if (chat.sender.username === currentUsername) {
        return chat.receiver.username;
      } else if (chat.receiver.username === currentUsername) {
        return chat.sender.username;
      }
    }
    
    // If chat name is not the current user's name, use it
    if (chat.name && chat.name !== currentUsername) {
      return chat.name;
    }
    
    // Use fetched user information if available
    if (chatUser) {
      return chatUser.username;
    }
    
    // For direct messages without user info, show generic name
    if (chat.type === 'direct' && !chat.name) {
      return `User ${chat.id}`;
    }
    
    // Fallback
    return 'Unknown Chat';
  };

  const getChatDisplayAvatar = (chat) => {
    const displayName = getChatDisplayName(chat);
    return displayName.charAt(0).toUpperCase();
  };

  if (!selectedChat) {
    return (
      <ChatContainer>
        <EmptyState>
          Select a chat to start messaging
        </EmptyState>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatAvatar>
          {getChatDisplayAvatar(selectedChat)}
        </ChatAvatar>
        <ChatInfo>
          <ChatName>{getChatDisplayName(selectedChat)}</ChatName>
          <ChatStatus>Online</ChatStatus>
        </ChatInfo>
      </ChatHeader>

      <MessagesContainer>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: 'var(--text-tertiary)',
            gap: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border-primary)',
              borderTop: '3px solid var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div>Loading messages...</div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <Message key={message.id} isOwn={message.sender_id === user?.id}>
                <MessageBubble isOwn={message.sender_id === user?.id}>
                  {message.content}
                  <MessageTime isOwn={message.sender_id === user?.id}>
                    {formatTime(message.created_at)}
                  </MessageTime>
                </MessageBubble>
              </Message>
            ))}
            {typingUsers.length > 0 && (
              <TypingIndicator>
                {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </TypingIndicator>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </MessagesContainer>

      <MessageInput>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', width: '100%', gap: '0.5rem' }}>
          <Input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={!selectedChat}
          />
          <SendButton type="submit" disabled={!newMessage.trim() || !selectedChat}>
            <FiSend />
          </SendButton>
        </form>
      </MessageInput>
    </ChatContainer>
  );
};

export default ChatWindow;
