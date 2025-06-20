import React, { useState, FormEvent, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { sendMessage } from './services/gemini';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
  align-items: center;
  justify-content: center;
`;

const ChatWindow = styled.div`
  width: 80%;
  max-width: 800px;
  height: 90vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const MessageList = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

interface MessageProps {
  isUser: boolean;
}

const Message = styled.div<MessageProps>`
  margin: 10px 0;
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 70%;
  align-self: ${props => (props.isUser ? 'flex-end' : 'flex-start')};
  background-color: ${props => (props.isUser ? '#007bff' : '#e9ecef')};
  color: ${props => (props.isUser ? 'white' : 'black')};
`;

const InputForm = styled.form`
  display: flex;
  padding: 20px;
  border-top: 1px solid #ddd;
`;

const Input = styled.input`
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 18px;
  padding: 10px 15px;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 18px;
  padding: 10px 20px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background-color: #0056b3;
  }
  &:disabled {
    background-color: #a0c7e4;
    cursor: not-allowed;
  }
`;

interface ChatMessage {
    text: string;
    isUser: boolean;
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the message list whenever messages change
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const botResponse = await sendMessage(currentInput);
      const botMessage: ChatMessage = { text: botResponse, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { text: 'Sorry, something went wrong.', isUser: false };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContainer>
      <ChatWindow>
        <MessageList ref={messageListRef}>
          {messages.map((msg, index) => (
            <Message key={index} isUser={msg.isUser}>
              {msg.text}
            </Message>
          ))}
           {isLoading && <Message isUser={false}>...</Message>}
        </MessageList>
        <InputForm onSubmit={handleSubmit}>
          <Input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <SendButton type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? 'Sending...' : 'Send'}
          </SendButton>
        </InputForm>
      </ChatWindow>
    </AppContainer>
  );
}

export default App;
