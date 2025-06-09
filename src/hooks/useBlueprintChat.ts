import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ApiError {
  error?: string;
  detail?: string;
}

export const useBlueprintChat = (fileUrl: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<ApiError>;
      if (axiosError.response?.data?.error?.includes('OPENAI_API_KEY')) {
        return 'OpenAI API key not configured. Please contact support.';
      }
      return axiosError.response?.data?.error || axiosError.response?.data?.detail || axiosError.message;
    }
    return err instanceof Error ? err.message : 'An unexpected error occurred';
  };

  // Initialize chat session when blueprint loads
  const initializeChat = useCallback(async () => {
    if (!fileUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.post(`${API_BASE_URL}/analyze-blueprint`, {
        fileUrl
      });
      
      // Add initial system message
      setMessages([{
        id: Date.now().toString(),
        role: 'system',
        content: 'Hello! I can help you analyze this blueprint. What would you like to know?',
        timestamp: new Date()
      }]);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      // Add error message to chat
      setMessages([{
        id: Date.now().toString(),
        role: 'system',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again later or contact support if the issue persists.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [fileUrl]);

  // Send message to chat
  const sendMessage = useCallback(async (content: string) => {
    if (!fileUrl) {
      setError('No blueprint loaded');
      return;
    }

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        fileUrl,
        question: content
      });

      // Add assistant response while preserving all previous messages
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.answer,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      // Add error message to chat while preserving previous messages
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fileUrl]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    initializeChat();
  }, [initializeChat]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    initializeChat
  };
}; 