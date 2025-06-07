import { create } from 'zustand';
import { generateId } from '../lib/utils';
import { supabase, STORAGE_BUCKET } from '../lib/supabase';

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  project_id?: string;
  thumbnail: string;
  dateUploaded: Date;
  pageCount: number;
  fileUrl: string;
  fileName: string;
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
  deleteBlueprint: (id: string) => Promise<void>;
  updateBlueprint: (id: string, data: Partial<Blueprint>) => void;
  setUploadProgress: (progress: number) => void;
  fetchBlueprints: () => Promise<void>;
  uploadBlueprint: (file: File, metadata: { name: string; project_id?: string; description?: string }) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  clearError: () => void;
}

// Sample thumbnails for development
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
    project_id: 'Alpha Homes',
    thumbnail: sampleThumbnails[0],
    dateUploaded: new Date('2024-01-15'),
    pageCount: 4,
    fileUrl: '/blueprints/residential-alpha.pdf',
    fileName: 'residential-alpha.pdf',
    status: 'ready'
  },
  {
    id: '2',
    name: 'Commercial Building Beta',
    description: 'Multi-use commercial space with retail and office areas',
    project_id: 'Urban Developments',
    thumbnail: sampleThumbnails[1],
    dateUploaded: new Date('2024-02-03'),
    pageCount: 12,
    fileUrl: '/blueprints/commercial-beta.pdf',
    fileName: 'commercial-beta.pdf',
    status: 'ready'
  },
  {
    id: '3',
    name: 'Renovation Plan Gamma',
    description: 'Kitchen and bathroom renovation details',
    project_id: 'Renovation Solutions',
    thumbnail: sampleThumbnails[2],
    dateUploaded: new Date('2024-02-28'),
    pageCount: 2,
    fileUrl: '/blueprints/renovation-gamma.pdf',
    fileName: 'renovation-gamma.pdf',
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
      project_id: blueprint.project_id,
      thumbnail: blueprint.thumbnail || sampleThumbnails[Math.floor(Math.random() * sampleThumbnails.length)],
      dateUploaded: new Date(),
      pageCount: blueprint.pageCount || 1,
      fileUrl: blueprint.fileUrl || '',
      fileName: blueprint.fileName || '',
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
  
  deleteBlueprint: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Authentication required to delete blueprints');
      }

      // First, get the blueprint details to get the storage path
      const { data: blueprint, error: fetchError } = await supabase
        .from('pdf_documents')
        .select('storage_path')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!blueprint) {
        throw new Error('Blueprint not found or you do not have permission to delete it');
      }

      // Delete the file from storage first
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([blueprint.storage_path]);

      if (storageError) {
        throw storageError;
      }

      // Then delete the database record (RLS will enforce ownership)
      const { error: deleteError } = await supabase
        .from('pdf_documents')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state only after both operations succeed
      set(state => ({
        blueprints: state.blueprints.filter(bp => bp.id !== id),
        selectedBlueprint: state.selectedBlueprint?.id === id ? null : state.selectedBlueprint,
        isLoading: false
      }));

    } catch (error) {
      console.error('Delete failed:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete blueprint',
        isLoading: false 
      });
      throw error;
    }
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
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Authentication required to fetch blueprints');
      }

      // Fetch blueprints where uploaded_by matches the current user
      const { data: blueprints, error: fetchError } = await supabase
        .from('pdf_documents')
        .select('*')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to match our Blueprint interface
      const transformedBlueprints: Blueprint[] = blueprints.map(bp => ({
        id: bp.id,
        name: bp.name,
        description: bp.description,
        project_id: bp.project_id,
        status: bp.status,
        dateUploaded: new Date(bp.created_at),
        pageCount: bp.page_count,
        fileUrl: supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(bp.storage_path)
          .data.publicUrl,
        fileName: bp.name,
        thumbnail: sampleThumbnails[Math.floor(Math.random() * sampleThumbnails.length)]
      }));

      set({ 
        blueprints: transformedBlueprints,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch blueprints:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch blueprints',
        isLoading: false 
      });
    }
  },

  uploadBlueprint: async (file: File, metadata) => {
    set({ uploadProgress: 0, error: null });
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Authentication required to upload blueprints');
      }

      // Generate document ID
      const documentId = generateId();
      const storagePath = `documents/${documentId}.pdf`;

      // 1. First create the database record
      const { data: blueprintData, error: insertError } = await supabase
        .from('pdf_documents')
        .insert({
          id: documentId,
          name: metadata.name,
          project_id: metadata.project_id,
          description: metadata.description,
          storage_path: storagePath,
          uploaded_by: user.id, // Critical for RLS
          page_count: 1,
          status: 'processing',
          access_level: 'private'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert failed:', insertError);
        throw new Error(`Failed to create blueprint record: ${insertError.message}`);
      }

      if (!blueprintData) {
        throw new Error('Failed to create blueprint record: No data returned');
      }

      // 2. Then upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file);

      if (uploadError) {
        // If storage upload fails, clean up the database record
        const { error: cleanupError } = await supabase
          .from('pdf_documents')
          .delete()
          .eq('id', documentId);
          
        if (cleanupError) {
          console.error('Failed to cleanup database record after storage upload failure:', cleanupError);
        }
        
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      // Add the new blueprint to the store
      const newBlueprint: Blueprint = {
        id: documentId,
        name: metadata.name,
        project_id: metadata.project_id,
        description: metadata.description,
        status: 'processing',
        dateUploaded: new Date(),
        pageCount: 1,
        fileUrl: publicUrl,
        fileName: metadata.name,
        thumbnail: sampleThumbnails[Math.floor(Math.random() * sampleThumbnails.length)]
      };
      
      set(state => ({
        blueprints: [newBlueprint, ...state.blueprints],
        uploadProgress: 100
      }));

      // Process the PDF
      setTimeout(() => {
        set(state => ({
          blueprints: state.blueprints.map(bp =>
            bp.id === newBlueprint.id
              ? { ...bp, status: 'ready' }
              : bp
          )
        }));
      }, 3000);

    } catch (error) {
      console.error('Upload failed:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to upload blueprint',
        isLoading: false,
        uploadProgress: 0
      });
      throw error;
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

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'This is a mock response. The AI assistant is not available in the frontend-only demo.',
        timestamp: new Date().toISOString(),
      };
      
      set(state => ({
        chatMessages: [...state.chatMessages, assistantMessage],
        isLoading: false
      }));
    }, 1000);
  },

  clearError: () => set({ error: null }),
}));