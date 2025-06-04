import { create } from 'zustand';
import { generateId } from '../lib/utils';

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

interface BlueprintState {
  blueprints: Blueprint[];
  selectedBlueprint: Blueprint | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
  
  addBlueprint: (blueprint: Partial<Blueprint>) => void;
  getBlueprint: (id: string) => Blueprint | undefined;
  selectBlueprint: (id: string) => void;
  deleteBlueprint: (id: string) => void;
  updateBlueprint: (id: string, data: Partial<Blueprint>) => void;
  setUploadProgress: (progress: number) => void;
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
  blueprints: [...mockBlueprints],
  selectedBlueprint: null,
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
  
  selectBlueprint: (id) => {
    const blueprint = get().blueprints.find(bp => bp.id === id) || null;
    set({ selectedBlueprint: blueprint });
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
  }
}));