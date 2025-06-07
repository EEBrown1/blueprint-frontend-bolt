import { Button } from '../ui/Button';
import { Pen, Eraser, Square, Circle, ArrowLeft } from 'lucide-react';
import { MousePointer, StickyNote, Ruler } from 'lucide-react';

export type AnnotationTool = 'cursor' | 'sticky' | 'pen' | 'ruler' | 'eraser';

interface AnnotationToolbarProps {
  selectedTool: AnnotationTool;
  onToolSelect: (tool: AnnotationTool) => void;
}

const AnnotationToolbar = ({ selectedTool, onToolSelect }: AnnotationToolbarProps) => {
  const tools = [
    { id: 'cursor' as AnnotationTool, icon: MousePointer, label: 'Select' },
    { id: 'sticky' as AnnotationTool, icon: StickyNote, label: 'Sticky Note' },
    { id: 'pen' as AnnotationTool, icon: Pen, label: 'Draw' },
    { id: 'ruler' as AnnotationTool, icon: Ruler, label: 'Measure' },
    { id: 'eraser' as AnnotationTool, icon: Eraser, label: 'Erase' },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex flex-row gap-2 z-50">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={selectedTool === tool.id ? 'primary' : 'ghost'}
          size="icon"
          onClick={() => onToolSelect(tool.id)}
          title={tool.label}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
};

export default AnnotationToolbar; 