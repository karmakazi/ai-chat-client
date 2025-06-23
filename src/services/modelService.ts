import { sendMessage as sendGeminiMessage } from './gemini';
import { sendMessage as sendClaudeMessage } from './claude';
import { sendMessage as sendChatGPTMessage, ChatGPTMessage } from './chatgpt';

export type ModelType = 'gemini' | 'claude' | 'chatgpt';

export const DEFAULT_MODEL: ModelType = 'gemini';

export async function sendMessage(message: string, model: ModelType = DEFAULT_MODEL, trainingData?: string) {
  console.log(`🤖 Using model: ${model.toUpperCase()}`);
  switch (model) {
    case 'claude':
      return sendClaudeMessage(message);
    case 'chatgpt':
      const messages: ChatGPTMessage[] = [
        { role: 'user', content: message }
      ];
      return sendChatGPTMessage(messages, trainingData);
    case 'gemini':
    default:
      return sendGeminiMessage(message);
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