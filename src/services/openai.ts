import OpenAI from 'openai';

// Define the API key from environment variables
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: This is not recommended for production apps
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
  suggestedPrompts: string[];
}

// Function to generate follow-up questions based on the conversation
const generateFollowUpQuestions = async (conversation: ChatMessage[]): Promise<string[]> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Generate 4 follow-up questions based on the conversation. Return only the questions as a JSON array of strings. Make the questions concise and directly related to the last message.'
        },
        ...conversation,
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message.content || '{"questions": []}';
    const parsedContent = JSON.parse(content);
    return parsedContent.questions || [];
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    return [
      'Can you tell me more about that?',
      'What else would you like to know?',
      'Do you have any specific questions?',
      'Would you like me to explain further?'
    ];
  }
};

// Send message to OpenAI API
export const sendMessage = async (messages: ChatMessage[]): Promise<ChatResponse> => {
  try {
    // Check if API key is available
    if (!apiKey) {
      throw new Error('OpenAI API key is not set. Please add it to your .env file.');
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful, friendly AI assistant. Provide concise and informative responses.'
        },
        ...messages
      ],
    });

    const assistantMessage = response.choices[0]?.message;

    if (!assistantMessage) {
      throw new Error('No response from OpenAI API');
    }

    // Generate follow-up questions
    const suggestedPrompts = await generateFollowUpQuestions([
      ...messages, 
      { 
        role: 'assistant', 
        content: assistantMessage.content || '' 
      }
    ]);

    return {
      message: {
        role: 'assistant',
        content: assistantMessage.content || ''
      },
      suggestedPrompts
    };
  } catch (error) {
    // Improved error logging
    if (error instanceof Error) {
      console.error('OpenAI API Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Unknown error:', error);
    }

    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('API key')) {
      return {
        message: {
          role: 'assistant',
          content: 'API key error: Please check your OpenAI API key configuration.'
        },
        suggestedPrompts: [
          'Check your .env file',
          'Verify your API key is valid',
          'Make sure the API key is properly set',
          'Contact support if the issue persists'
        ]
      };
    }

    // General error response
    return {
      message: {
        role: 'assistant',
        content: 'An error occurred while processing your request. Please check the console for details and try again.'
      },
      suggestedPrompts: [
        'Try asking your question again',
        'Rephrase your question',
        'Check your internet connection',
        'Try a simpler query'
      ]
    };
  }
};

