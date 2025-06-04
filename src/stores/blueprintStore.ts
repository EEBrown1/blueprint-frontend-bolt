import { create } from 'zustand';
import { generateId } from '../lib/utils';
import blueprintApi, { ChatResponse } from '../lib/api';

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  project?: string;
  thumbnail: string;
  dateUploaded: Date;
  pageCount: number;
  fileUrl: string;
  status: 'processing' | 'ready' | 'error';
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: string;
  confidence?: number;
}

interface BlueprintState {
  blueprints: Blueprint[];
  selectedBlueprint: Blueprint | null;
  chatMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
  
  addBlueprint: (blueprint: Partial<Blueprint>) => void;
  getBlueprint: (id: string) => Blueprint | undefined;
  selectBlueprint: (blueprint: Blueprint) => void;
  deleteBlueprint: (id: string) => void;
  updateBlueprint: (id: string, data: Partial<Blueprint>) => void;
  setUploadProgress: (progress: number) => void;
  fetchBlueprints: () => Promise<void>;
  uploadBlueprint: (file: File, metadata: { name: string; project?: string; description?: string }) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  clearError: () => void;
}

// Sample blueprint thumbnails
const sampleThumbnails = [
  'https://images.pexels.com/photos/5582597/pexels-photo-5582597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/6444/pencil-architecture-desk-ruler.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/834892/pexels-photo-834892.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
];

// Mock data for demonstration
const mockBlueprints: Blueprint[] = [
  {
    id: '1',
    name: 'Residential Project Alpha',
    description: 'Modern single-family home with 3 bedrooms and 2 bathrooms',
    project: 'Alpha Homes',
    thumbnail: sampleThumbnails[0],
    dateUploaded: new Date('2024-01-15'),
    pageCount: 4,
    fileUrl: '/blueprints/residential-alpha.pdf',
    status: 'ready'
  },
  {
    id: '2',
    name: 'Commercial Building Beta',
    description: 'Multi-use commercial space with retail and office areas',
    project: 'Urban Developments',
    thumbnail: sampleThumbnails[1],
    dateUploaded: new Date('2024-02-03'),
    pageCount: 12,
    fileUrl: '/blueprints/commercial-beta.pdf',
    status: 'ready'
  },
  {
    id: '3',
    name: 'Renovation Plan Gamma',
    description: 'Kitchen and bathroom renovation details',
    project: 'Renovation Solutions',
    thumbnail: sampleThumbnails[2],
    dateUploaded: new Date('2024-02-28'),
    pageCount: 2,
    fileUrl: '/blueprints/renovation-gamma.pdf',
    status: 'ready'
  }
];

export const useBlueprintStore = create<BlueprintState>((set, get) => ({
  blueprints: [],
  selectedBlueprint: null,
  chatMessages: [],
  isLoading: false,
  error: null,
  uploadProgress: 0,
  
  addBlueprint: (blueprint) => {
    const newBlueprint: Blueprint = {
      id: generateId(),
      name: blueprint.name || 'Untitled Blueprint',
      description: blueprint.description,
      project: blueprint.project,
      thumbnail: blueprint.thumbnail || sampleThumbnails[Math.floor(Math.random() * sampleThumbnails.length)],
      dateUploaded: new Date(),
      pageCount: blueprint.pageCount || 1,
      fileUrl: blueprint.fileUrl || '',
      status: 'processing'
    };
    
    set((state) => ({
      blueprints: [newBlueprint, ...state.blueprints],
      uploadProgress: 0
    }));
    
    // Simulate processing completion
    setTimeout(() => {
      set((state) => ({
        blueprints: state.blueprints.map(bp => 
          bp.id === newBlueprint.id ? { ...bp, status: 'ready' } : bp
        )
      }));
    }, 3000);
    
    return newBlueprint.id;
  },
  
  getBlueprint: (id) => {
    return get().blueprints.find(bp => bp.id === id);
  },
  
  selectBlueprint: (blueprint) => {
    set({ 
      selectedBlueprint: blueprint,
      chatMessages: [] // Clear chat messages when selecting a new blueprint
    });
  },
  
  deleteBlueprint: (id) => {
    set((state) => ({
      blueprints: state.blueprints.filter(bp => bp.id !== id),
      selectedBlueprint: state.selectedBlueprint?.id === id ? null : state.selectedBlueprint
    }));
  },
  
  updateBlueprint: (id, data) => {
    set((state) => ({
      blueprints: state.blueprints.map(bp => 
        bp.id === id ? { ...bp, ...data } : bp
      ),
      selectedBlueprint: state.selectedBlueprint?.id === id 
        ? { ...state.selectedBlueprint, ...data } 
        : state.selectedBlueprint
    }));
  },
  
  setUploadProgress: (progress) => {
    set({ uploadProgress: progress });
  },

  fetchBlueprints: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await blueprintApi.getFiles();
      set({ blueprints: response.files });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch blueprints' });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadBlueprint: async (file: File, metadata) => {
    set({ uploadProgress: 0, error: null });
    try {
      const response = await blueprintApi.uploadBlueprint(file);
      
      // Add the new blueprint to the store
      const newBlueprint: Blueprint = {
        id: response.file_id,
        name: metadata.name,
        project: metadata.project,
        description: metadata.description,
        status: 'processing',
        dateUploaded: new Date(),
        pageCount: 0,
        fileUrl: '',
        thumbnail: sampleThumbnails[Math.floor(Math.random() * sampleThumbnails.length)]
      };
      
      set(state => ({
        blueprints: [...state.blueprints, newBlueprint],
        uploadProgress: 100
      }));
      
      // Start polling for status
      const checkStatus = async () => {
        const status = await blueprintApi.getFileStatus(response.file_id);
        if (status.status === 'processing') {
          setTimeout(checkStatus, 2000); // Poll every 2 seconds
        } else {
          set(state => ({
            blueprints: state.blueprints.map(bp =>
              bp.id === response.file_id
                ? { ...bp, status: status.status, pageCount: status.page_count }
                : bp
            )
          }));
        }
      };
      
      checkStatus();
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to upload blueprint',
        uploadProgress: 0
      });
    }
  },

  sendMessage: async (message: string) => {
    const { selectedBlueprint } = get();
    if (!selectedBlueprint) {
      set({ error: 'No blueprint selected' });
      return;
    }

    set({ isLoading: true, error: null });
    
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    set(state => ({
      chatMessages: [...state.chatMessages, userMessage]
    }));

    try {
      const response = await blueprintApi.sendMessage(selectedBlueprint.id, message);
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.response,
        context: response.context,
        confidence: response.confidence,
        timestamp: new Date().toISOString(),
      };
      
      set(state => ({
        chatMessages: [...state.chatMessages, assistantMessage]
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to send message' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));