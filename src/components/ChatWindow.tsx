import { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import PromptButtons from './PromptButtons';
import { sendMessage, ChatMessage } from '../services/openai';

// Define message types
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Define suggested prompt type
export interface SuggestedPrompt {
  id: string;
  text: string;
}

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Function to handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message to the chat
    const userMessage: Message = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      // Convert messages to the format expected by the OpenAI service
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add the new user message
      chatMessages.push({
        role: 'user',
        content
      });

      // Send the messages to the OpenAI service
      const response = await sendMessage(chatMessages);

      // Add assistant message to the chat
      const assistantMessage: Message = {
        id: generateId(),
        content: response.message.content,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      // Generate suggested follow-up prompts from the response
      const newPrompts: SuggestedPrompt[] = response.suggestedPrompts.map(text => ({
        id: generateId(),
        text
      }));

      setSuggestedPrompts(newPrompts);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle clicking a suggested prompt
  const handlePromptClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      {suggestedPrompts.length > 0 && !isLoading && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <PromptButtons
            prompts={suggestedPrompts}
            onPromptClick={handlePromptClick}
          />
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
