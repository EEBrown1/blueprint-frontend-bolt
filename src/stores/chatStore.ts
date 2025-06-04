import { create } from 'zustand';
import { generateId } from '../lib/utils';
import blueprintApi from '../lib/api';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Highlight {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  page: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  highlights?: Highlight[];
  measurements?: string[];
  elements?: { name: string; count: number }[];
  loading?: boolean;
}

interface ChatState {
  messages: Record<string, Message[]>;
  currentBlueprintId: string | null;
  isTyping: boolean;
  error: string | null;
  
  setCurrentBlueprint: (blueprintId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  currentBlueprintId: null,
  isTyping: false,
  error: null,
  
  setCurrentBlueprint: (blueprintId) => {
    set({ currentBlueprintId: blueprintId });
    
    // Initialize chat history if it doesn't exist
    if (!get().messages[blueprintId]) {
      set((state) => ({
        messages: {
          ...state.messages,
          [blueprintId]: [
            {
              id: generateId(),
              role: 'system',
              content: 'Hello! I can answer questions about this blueprint. What would you like to know?',
              timestamp: new Date()
            }
          ]
        }
      }));
    }
  },
  
  sendMessage: async (content) => {
    const blueprintId = get().currentBlueprintId;
    if (!blueprintId) {
      set({ error: 'No blueprint selected' });
      return;
    }
    
    // Add user message
    const userMessageId = generateId();
    set((state) => ({
      messages: {
        ...state.messages,
        [blueprintId]: [
          ...(state.messages[blueprintId] || []),
          {
            id: userMessageId,
            role: 'user',
            content,
            timestamp: new Date()
          }
        ]
      },
      isTyping: true,
      error: null
    }));
    
    try {
      // Send message to API
      const response = await blueprintApi.sendMessage(blueprintId, content);
      
      // Add assistant response
      set((state) => ({
        messages: {
          ...state.messages,
          [blueprintId]: [
            ...(state.messages[blueprintId] || []),
            {
              id: generateId(),
              role: 'assistant',
              content: response.response,
              timestamp: new Date(),
              highlights: response.context ? JSON.parse(response.context).highlights : undefined,
              measurements: response.context ? JSON.parse(response.context).measurements : undefined,
              elements: response.context ? JSON.parse(response.context).elements : undefined
            }
          ]
        },
        isTyping: false
      }));
    } catch (error) {
      set({ 
        isTyping: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      });
    }
  },
  
  clearChat: () => {
    const blueprintId = get().currentBlueprintId;
    if (!blueprintId) return;
    
    set((state) => ({
      messages: {
        ...state.messages,
        [blueprintId]: [
          {
            id: generateId(),
            role: 'system',
            content: 'Chat history has been cleared. What would you like to know about this blueprint?',
            timestamp: new Date()
          }
        ]
      },
      error: null
    }));
  },

  setError: (error) => set({ error })
}));