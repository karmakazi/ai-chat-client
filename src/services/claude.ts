import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.REACT_APP_CLAUDE_API_KEY;

if (!apiKey) {
  throw new Error("REACT_APP_CLAUDE_API_KEY is not set");
}

const anthropic = new Anthropic({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Allow browser usage
});

export async function sendMessage(message: string) {
  try {
    // Split the message into system and user parts
    const parts = message.split('User: ');
    const systemPrompt = parts[0].trim();
    const userMessage = parts[1] || message;

    // Combine system instructions with user message
    const fullMessage = `${systemPrompt}\n\nUser message: ${userMessage}`;

    console.log('📤 Sending request to Claude...');
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [{ role: "user", content: fullMessage }]
    });
    
    // Handle different content block types
    const content = response.content[0];
    if ('text' in content) {
      console.log('📥 Received response from Claude');
      return content.text;
    } else {
      throw new Error("Unexpected response format from Claude API");
    }
  } catch (error) {
    console.error("Error sending message to Claude:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
} 