import { sendMessage as sendGeminiMessage } from './gemini';
import { sendMessage as sendClaudeMessage } from './claude';
import { sendMessage as sendChatGPTMessage, ChatGPTMessage } from './chatgpt';

export type ModelType = 'gemini' | 'claude' | 'chatgpt';

export const DEFAULT_MODEL: ModelType = 'gemini';

// Settings keys
const MODEL_PREFERENCE_KEY = 'selectedModel';
const MESSAGE_HISTORY_ENABLED_KEY = 'messageHistoryEnabled';
const MESSAGE_HISTORY_LENGTH_KEY = 'messageHistoryLength';

// Default settings
export const DEFAULT_MESSAGE_HISTORY_ENABLED = false;
export const DEFAULT_MESSAGE_HISTORY_LENGTH = 5;
export const MAX_MESSAGE_HISTORY_LENGTH = 10;

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendMessage(
  message: string,
  model: ModelType = DEFAULT_MODEL,
  trainingData?: string,
  messageHistory: Message[] = []
) {
  console.log(`🤖 Using model: ${model.toUpperCase()}`);
  
  // Apply message history settings
  const historyEnabled = getMessageHistoryEnabled();
  const historyLength = getMessageHistoryLength();
  
  // If history is disabled or length is 0, ignore message history
  const effectiveHistory = historyEnabled ? messageHistory.slice(-historyLength) : [];
  console.log('📜 Message history:', effectiveHistory);

  switch (model) {
    case 'claude':
      // For Claude, we'll concatenate history into the prompt
      const claudeHistory = effectiveHistory
        .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      const claudePrompt = claudeHistory ? `${claudeHistory}\nHuman: ${message}` : message;
      return sendClaudeMessage(claudePrompt);

    case 'chatgpt':
      // For ChatGPT, we'll convert messages to its format
      const chatGPTMessages: ChatGPTMessage[] = [
        ...effectiveHistory,
        { role: 'user', content: message }
      ];
      return sendChatGPTMessage(chatGPTMessages, trainingData);

    case 'gemini':
    default:
      // For Gemini, we'll concatenate history into the prompt
      const geminiHistory = effectiveHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Model'}: ${msg.content}`)
        .join('\n');
      const geminiPrompt = geminiHistory ? `${geminiHistory}\nUser: ${message}` : message;
      return sendGeminiMessage(geminiPrompt);
  }
}

// Settings management functions
export function getSelectedModel(): ModelType {
  const storedModel = localStorage.getItem(MODEL_PREFERENCE_KEY);
  return (storedModel as ModelType) || DEFAULT_MODEL;
}

export function setSelectedModel(model: ModelType) {
  console.log(`🔄 Switching to model: ${model.toUpperCase()}`);
  localStorage.setItem(MODEL_PREFERENCE_KEY, model);
}

export function getMessageHistoryEnabled(): boolean {
  const stored = localStorage.getItem(MESSAGE_HISTORY_ENABLED_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_MESSAGE_HISTORY_ENABLED;
}

export function setMessageHistoryEnabled(enabled: boolean) {
  localStorage.setItem(MESSAGE_HISTORY_ENABLED_KEY, JSON.stringify(enabled));
}

export function getMessageHistoryLength(): number {
  const stored = localStorage.getItem(MESSAGE_HISTORY_LENGTH_KEY);
  return stored ? parseInt(stored, 10) : DEFAULT_MESSAGE_HISTORY_LENGTH;
}

export function setMessageHistoryLength(length: number) {
  if (length < 0) length = 0;
  if (length > MAX_MESSAGE_HISTORY_LENGTH) length = MAX_MESSAGE_HISTORY_LENGTH;
  localStorage.setItem(MESSAGE_HISTORY_LENGTH_KEY, length.toString());
} 