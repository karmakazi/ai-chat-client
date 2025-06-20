import React, { useState, FormEvent, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { sendMessage, getSelectedModel } from '../services/modelService';
import { TrainingData } from './Admin';

interface Settings {
  personality: {
    tone: string;
    customTone: string;
  };
  response: {
    lengthPreference: string;
    minWords: number;
    maxWords: number;
  };
}

const SETTINGS_STORAGE_KEY = 'chatSettings';
const DEFAULT_SETTINGS = {
  personality: {
    tone: 'professional',
    customTone: '',
  },
  response: {
    lengthPreference: 'balanced',
    minWords: 50,
    maxWords: 200,
  }
};

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const typingAnimation = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
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
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
`;

const ChatHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModelBadge = styled.div`
  padding: 5px 10px;
  background-color: #e9ecef;
  border-radius: 15px;
  font-size: 0.9rem;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const MessageList = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
    
    &:hover {
      background: #555;
    }
  }
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
  white-space: pre-wrap;
  opacity: 0;
  animation: ${fadeIn} 0.3s ease forwards;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: 10px;
  align-self: flex-start;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  background-color: #007bff;
  border-radius: 50%;
  animation: ${typingAnimation} 1.4s infinite;
  
  &:nth-of-type(2) {
    animation-delay: 0.2s;
  }
  
  &:nth-of-type(3) {
    animation-delay: 0.4s;
  }
`;

const InputForm = styled.form`
  display: flex;
  padding: 20px;
  border-top: 1px solid #ddd;
  transition: all 0.3s ease;
  
  &:focus-within {
    background-color: #f8f9fa;
  }
`;

const Input = styled.input`
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 18px;
  padding: 10px 15px;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
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
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: #0056b3;
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #a0c7e4;
    cursor: not-allowed;
    transform: none;
  }
`;

interface ChatMessage {
    text: string;
    isUser: boolean;
}

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const getPersonalityPrompt = (settings: Settings) => {
    if (settings.personality.tone === 'custom' && settings.personality.customTone) {
      return `Please respond in the following style: ${settings.personality.customTone}.\n\n`;
    }

    const toneGuides = {
      professional: 'Please respond in a professional and formal manner.',
      casual: 'Please respond in a casual and relaxed tone.',
      friendly: 'Please respond in a friendly and approachable manner.',
      technical: 'Please respond with technical precision and detail.',
    };

    return `${toneGuides[settings.personality.tone as keyof typeof toneGuides]}\n\n`;
  };

  const getLengthPrompt = (settings: Settings) => {
    if (settings.response.lengthPreference === 'custom') {
      return `Please keep your response between ${settings.response.minWords} and ${settings.response.maxWords} words.\n\n`;
    }

    const lengthGuides = {
      brief: 'Please keep your responses concise and to the point, using no more than 50 words.',
      balanced: 'Please provide balanced responses with moderate detail, using between 50-200 words.',
      detailed: 'Please provide detailed and comprehensive responses, using at least 200 words.',
    };

    return `${lengthGuides[settings.response.lengthPreference as keyof typeof lengthGuides]}\n\n`;
  };

  const formatTrainingDataForPrompt = (trainingData: TrainingData[]) => {
    if (!trainingData.length) {
      console.log('No training data found');
      return '';
    }
    
    const enabledTraining = trainingData.filter(example => example.isEnabled);
    if (!enabledTraining.length) {
      console.log('No enabled training examples found');
      return '';
    }

    // Sort by priority (high -> medium -> low)
    const sortedTraining = [...enabledTraining].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const formatByPriority = (examples: TrainingData[], priority: 'high' | 'medium' | 'low') => {
      const filtered = examples.filter(ex => ex.priority === priority);
      if (!filtered.length) return '';
      
      return `${priority.toUpperCase()} PRIORITY CONTEXT:\n` +
        filtered.map(example => example.context).join('\n\n') + '\n\n';
    };

    const formattedPrompt = 'Here is some context to inform your responses, ordered by priority:\n\n' +
      formatByPriority(sortedTraining, 'high') +
      formatByPriority(sortedTraining, 'medium') +
      formatByPriority(sortedTraining, 'low') +
      'Please use this context to inform your response to the following:\n';

    console.log('Formatted training data:', formattedPrompt);
    return formattedPrompt;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);

    try {
      // Get training examples
      const storedExamples = localStorage.getItem('trainingExamples');
      console.log('Retrieved training examples from localStorage:', storedExamples);
      const trainingData: TrainingData[] = storedExamples ? JSON.parse(storedExamples) : [];
      
      // Build the prompt
      const personalityPrompt = getPersonalityPrompt(settings);
      const lengthPrompt = getLengthPrompt(settings);
      const trainingPrompt = formatTrainingDataForPrompt(trainingData);
      
      const fullPrompt = `${personalityPrompt}${lengthPrompt}${trainingPrompt}User: ${userMessage}`;
      console.log('Full prompt being sent:', fullPrompt);
      
      // Get the currently selected model
      const selectedModel = getSelectedModel();
      console.log('Selected model:', selectedModel);
      
      // Send message using the model service with the selected model
      const response = await sendMessage(fullPrompt, selectedModel);
      
      // Add AI response to chat
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { 
        text: "I apologize, but I encountered an error. Please try again.",
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModel = getSelectedModel();

  return (
    <AppContainer>
      <ChatWindow>
        <ChatHeader>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Chat Interface</h2>
          <ModelBadge>
            🤖 {selectedModel.toUpperCase()}
          </ModelBadge>
        </ChatHeader>
        <MessageList ref={messageListRef}>
          {messages.map((msg, index) => (
            <Message 
              key={index} 
              isUser={msg.isUser}
              style={{ 
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {msg.text}
            </Message>
          ))}
          {isLoading && (
            <LoadingDots>
              <Dot />
              <Dot />
              <Dot />
            </LoadingDots>
          )}
        </MessageList>
        <InputForm onSubmit={handleSubmit}>
          <Input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <SendButton 
            type="submit" 
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </SendButton>
        </InputForm>
      </ChatWindow>
    </AppContainer>
  );
}

export default Chat; 