import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, var(--accent-primary) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, var(--accent-secondary) 0%, transparent 50%);
    opacity: 0.1;
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(1deg); }
  }
`;

const FormContainer = styled.div`
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  padding: 2.5rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  }
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  padding: 1rem 1.25rem;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
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
    outline: none;
    border-color: var(--accent-primary);
    background: var(--bg-quaternary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    transform: translateY(-1px);
  }

  &:hover:not(:focus) {
    border-color: var(--border-secondary);
    background: var(--bg-quaternary);
  }
`;

const Button = styled.button`
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--text-primary);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
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

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: var(--accent-primary);
  cursor: pointer;
  text-decoration: none;
  margin-top: 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all var(--transition-normal);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--accent-primary);
    transition: width var(--transition-normal);
  }

  &:hover {
    color: var(--accent-secondary);
    
    &::after {
      width: 100%;
    }
  }
`;

const Login = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Login successful!');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container>
      <FormContainer className="fade-in">
        <Title>Relatim Chats</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="slide-in-left"
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="slide-in-left"
            style={{ animationDelay: '0.1s' }}
          />
          <Button type="submit" disabled={loading} className="scale-in" style={{ animationDelay: '0.2s' }}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>
        <ToggleButton onClick={onToggleMode} className="fade-in" style={{ animationDelay: '0.3s' }}>
          Don't have an account? Sign up
        </ToggleButton>
      </FormContainer>
    </Container>
  );
};

export default Login;
