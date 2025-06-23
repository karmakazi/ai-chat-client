import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function sendMessage(messages: ChatGPTMessage[], trainingData?: string, temperature: number = 0.7) {
  try {
    // If training data exists, prepend it to the system message or create one
    if (trainingData) {
      const systemMessage = messages.find(msg => msg.role === 'system');
      if (systemMessage) {
        systemMessage.content = `${trainingData}\n\n${systemMessage.content}`;
      } else {
        messages.unshift({ role: 'system', content: trainingData });
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: temperature,
    });

    return {
      message: response.choices[0].message.content || '',
      role: 'assistant'
    };
  } catch (error) {
    console.error('Error in ChatGPT service:', error);
    throw error;
  }
} 