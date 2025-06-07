import { create } from 'zustand';
import { generateId } from '../lib/utils';

export interface Point {
  x: number;
  y: number;
}

export interface BaseAnnotation {
  id: string;
  type: 'sticky' | 'pen' | 'ruler';
  page: number;
  createdAt: Date;
}

export interface StickyNote extends BaseAnnotation {
  type: 'sticky';
  position: Point;
  content: string;
  color: string;
}

export interface PenStroke extends BaseAnnotation {
  type: 'pen';
  points: Point[];
  color: string;
  width: number;
}

export interface Measurement extends BaseAnnotation {
  type: 'ruler';
  start: Point;
  end: Point;
  measurement: string;
}

export type Annotation = StickyNote | PenStroke | Measurement;

type NewAnnotation = 
  | Omit<StickyNote, 'id' | 'createdAt'>
  | Omit<PenStroke, 'id' | 'createdAt'>
  | Omit<Measurement, 'id' | 'createdAt'>;

interface AnnotationState {
  annotations: Record<string, Annotation[]>; // blueprintId -> annotations
  selectedAnnotation: string | null;
  
  // Actions
  addAnnotation: (blueprintId: string, annotation: NewAnnotation) => void;
  updateAnnotation: (blueprintId: string, annotationId: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (blueprintId: string, annotationId: string) => void;
  selectAnnotation: (annotationId: string | null) => void;
  clearAnnotations: (blueprintId: string) => void;
}

export const useAnnotationStore = create<AnnotationState>((set) => ({
  annotations: {},
  selectedAnnotation: null,

  addAnnotation: (blueprintId, annotation) => set((state) => {
    const newAnnotation = {
      ...annotation,
      id: generateId(),
      createdAt: new Date(),
    } as Annotation;

    return {
      annotations: {
        ...state.annotations,
        [blueprintId]: [
          ...(state.annotations[blueprintId] || []),
          newAnnotation,
        ],
      },
    };
  }),

  updateAnnotation: (blueprintId, annotationId, updates) => set((state) => {
    const currentAnnotations = state.annotations[blueprintId];
    // If blueprint doesn't exist, return unchanged state
    if (!currentAnnotations) return state;

    // Find the annotation to update
    const annotationToUpdate = currentAnnotations.find(a => a.id === annotationId);
    if (!annotationToUpdate) return state;

    // Ensure type safety by only updating fields that exist on the specific annotation type
    const updatedAnnotation = {
      ...annotationToUpdate,
      ...updates,
      type: annotationToUpdate.type, // Preserve the original type
    } as Annotation;

    return {
      ...state,
      annotations: {
        ...state.annotations,
        [blueprintId]: currentAnnotations.map(a => 
          a.id === annotationId ? updatedAnnotation : a
        ),
      },
    };
  }),

  deleteAnnotation: (blueprintId, annotationId) => set((state) => ({
    annotations: {
      ...state.annotations,
      [blueprintId]: state.annotations[blueprintId]?.filter(
        (annotation) => annotation.id !== annotationId
      ) || [],
    },
    selectedAnnotation: state.selectedAnnotation === annotationId ? null : state.selectedAnnotation,
  })),

  selectAnnotation: (annotationId) => set({
    selectedAnnotation: annotationId,
  }),

  clearAnnotations: (blueprintId) => set((state) => ({
    annotations: {
      ...state.annotations,
      [blueprintId]: [],
    },
    selectedAnnotation: null,
  })),
})); 