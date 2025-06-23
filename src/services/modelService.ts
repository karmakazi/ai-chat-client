import { sendMessage as sendGeminiMessage } from './gemini';
import { sendMessage as sendClaudeMessage } from './claude';
import { sendMessage as sendChatGPTMessage, ChatGPTMessage } from './chatgpt';

export type ModelType = 'gemini' | 'claude' | 'chatgpt';

export const DEFAULT_MODEL: ModelType = 'gemini';

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
  console.log('📜 Message history:', messageHistory);

  switch (model) {
    case 'claude':
      // For Claude, we'll concatenate history into the prompt
      const claudeHistory = messageHistory
        .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      const claudePrompt = claudeHistory ? `${claudeHistory}\nHuman: ${message}` : message;
      return sendClaudeMessage(claudePrompt);

    case 'chatgpt':
      // For ChatGPT, we'll convert messages to its format
      const chatGPTMessages: ChatGPTMessage[] = [
        ...messageHistory,
        { role: 'user', content: message }
      ];
      return sendChatGPTMessage(chatGPTMessages, trainingData);

    case 'gemini':
    default:
      // For Gemini, we'll concatenate history into the prompt
      const geminiHistory = messageHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Model'}: ${msg.content}`)
        .join('\n');
      const geminiPrompt = geminiHistory ? `${geminiHistory}\nUser: ${message}` : message;
      return sendGeminiMessage(geminiPrompt);
  }
}

// Local storage key for model preference
const MODEL_PREFERENCE_KEY = 'selectedModel';

export function getSelectedModel(): ModelType {
  const storedModel = localStorage.getItem(MODEL_PREFERENCE_KEY);
  return (storedModel as ModelType) || DEFAULT_MODEL;
}

export function setSelectedModel(model: ModelType) {
  console.log(`🔄 Switching to model: ${model.toUpperCase()}`);
  localStorage.setItem(MODEL_PREFERENCE_KEY, model);
} 