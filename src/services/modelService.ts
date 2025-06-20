import { sendMessage as sendGeminiMessage } from './gemini';
import { sendMessage as sendClaudeMessage } from './claude';

export type ModelType = 'gemini' | 'claude';

export const DEFAULT_MODEL: ModelType = 'gemini';

export async function sendMessage(message: string, model: ModelType = DEFAULT_MODEL) {
  console.log(`🤖 Using model: ${model.toUpperCase()}`);
  switch (model) {
    case 'claude':
      return sendClaudeMessage(message);
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