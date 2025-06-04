import { create } from 'zustand';
import { generateId } from '../lib/utils';

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
  
  setCurrentBlueprint: (blueprintId: string) => void;
  sendMessage: (content: string) => void;
  clearChat: () => void;
}

// Sample assistant responses for demo purposes
const sampleResponses = [
  "Based on the blueprint, the living room dimensions are 16' x 14' with 9' ceilings. The total area is 224 square feet.",
  "There are 3 bedrooms in this plan. The master bedroom is located on the east side with two additional bedrooms on the west side of the home.",
  "The electrical plan shows 24 outlets throughout the main floor, with 8 GFCI outlets in the kitchen and bathrooms as required by code.",
  "For this renovation, you'll need approximately 240 square feet of tile for the bathroom floors and shower walls, plus 10% extra for cuts and waste.",
  "The load-bearing walls are highlighted on the structural plan. The main support beam spans 24 feet across the open concept kitchen and living area."
];

// Sample highlights for demonstration
const sampleHighlights: Highlight[] = [
  { x: 120, y: 150, width: 200, height: 180, color: 'rgba(37, 99, 235, 0.3)', page: 0 },
  { x: 400, y: 300, width: 150, height: 100, color: 'rgba(249, 115, 22, 0.3)', page: 0 }
];

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  currentBlueprintId: null,
  isTyping: false,
  
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
  
  sendMessage: (content) => {
    const blueprintId = get().currentBlueprintId;
    if (!blueprintId) return;
    
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
      isTyping: true
    }));
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const assistantMessageId = generateId();
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      const includeHighlights = Math.random() > 0.5;
      
      set((state) => ({
        messages: {
          ...state.messages,
          [blueprintId]: [
            ...(state.messages[blueprintId] || []),
            {
              id: assistantMessageId,
              role: 'assistant',
              content: randomResponse,
              timestamp: new Date(),
              highlights: includeHighlights ? sampleHighlights : undefined
            }
          ]
        },
        isTyping: false
      }));
    }, 1500);
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
      }
    }));
  }
}));