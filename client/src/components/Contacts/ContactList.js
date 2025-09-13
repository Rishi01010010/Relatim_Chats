import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FiUserPlus, FiSearch, FiUser, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ContactListContainer = styled.div`
  padding: 1.5rem;
  background: transparent;
  color: var(--text-primary);
  height: 100%;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.25rem 1rem 3rem;
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

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  z-index: 1;
`;

const AddContactButton = styled.button`
  width: 100%;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--text-primary);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  transition: all var(--transition-normal);
  font-weight: 600;
  font-size: 1rem;
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
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  background: rgba(38, 38, 38, 0.3);
  border: 1px solid var(--border-primary);
  position: relative;

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

const ContactAvatar = styled.div`
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

  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-lg);
  }
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: var(--success);
  border: 2px solid var(--bg-secondary);
  border-radius: var(--radius-full);
  animation: pulse 2s infinite;
`;

const ContactInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ContactName = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
  font-size: 1rem;
`;

const ContactStatus = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 400;
`;

const ActionButton = styled.button`
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: var(--accent-primary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  &:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: var(--accent-primary);
    transform: scale(1.1);
  }

  &:last-child {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: var(--error);

    &:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: var(--error);
    }
  }
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

const ContactList = ({ onStartChat }) => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/contacts');
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    const username = prompt('Enter username or email to add as contact:');
    if (!username) return;

    try {
      const response = await axios.post('/api/contacts', { contactId: username });
      toast.success('Contact added successfully');
      fetchContacts();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add contact';
      toast.error(errorMessage);
    }
  };

  const handleRemoveContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to remove this contact?')) return;

    try {
      await axios.delete(`/api/contacts/${contactId}`);
      toast.success('Contact removed successfully');
      fetchContacts();
    } catch (error) {
      toast.error('Failed to remove contact');
    }
  };

  const handleStartChat = async (contact) => {
    console.log('Starting chat with contact:', contact);
    try {
      const response = await axios.post('/api/chats', { contactId: contact.id });
      console.log('Chat created successfully:', response.data);
      onStartChat(response.data.chat);
      toast.success('Chat started');
    } catch (error) {
      console.log('Error creating chat:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to start chat';
      if (errorMessage.includes('already exists')) {
        // Chat already exists, get the existing chat ID and open it
        const existingChatId = error.response?.data?.chatId;
        console.log('Existing chat ID:', existingChatId);
        if (existingChatId) {
          // Create a chat object with the existing chat ID and contact info
          const existingChat = {
            id: existingChatId,
            name: contact.username,
            type: 'direct',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message: null,
            last_message_time: null,
            unread_count: 0
          };
          console.log('Opening existing chat:', existingChat);
          onStartChat(existingChat);
          toast('Opening existing chat');
        } else {
          toast.error('Chat exists but could not be opened');
        }
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <ContactListContainer>
        <LoadingState>Loading contacts...</LoadingState>
      </ContactListContainer>
    );
  }

  if (contacts.length === 0) {
    return (
      <ContactListContainer>
        <AddContactButton onClick={handleAddContact}>
          <FiUserPlus />
          Add Contact
        </AddContactButton>
        <EmptyState>
          <FiUser size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <div>No contacts yet</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Add contacts to start messaging
          </div>
        </EmptyState>
      </ContactListContainer>
    );
  }

  return (
    <ContactListContainer>
      <SearchContainer>
        <SearchIcon>
          <FiSearch />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchContainer>

      <AddContactButton onClick={handleAddContact}>
        <FiUserPlus />
        Add Contact
      </AddContactButton>

      {filteredContacts.map((contact) => (
        <ContactItem key={contact.id}>
          <ContactAvatar>
            {contact.username.charAt(0).toUpperCase()}
            {contact.status === 'online' && <OnlineIndicator />}
          </ContactAvatar>
          <ContactInfo>
            <ContactName>{contact.username}</ContactName>
            <ContactStatus>
              {contact.status === 'online' ? 'Online' : 'Offline'}
            </ContactStatus>
          </ContactInfo>
          <ActionButton
            onClick={() => handleStartChat(contact)}
            title="Start Chat"
          >
            <FiMessageCircle />
          </ActionButton>
          <ActionButton
            onClick={() => handleRemoveContact(contact.id)}
            title="Remove Contact"
          >
            ×
          </ActionButton>
        </ContactItem>
      ))}
    </ContactListContainer>
  );
};

export default ContactList;
