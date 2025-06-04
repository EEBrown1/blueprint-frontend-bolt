import { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize, ChevronLeft, 
  ChevronRight, Download, Layers, Move
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Button from '../ui/Button';
import { useChatStore, Highlight } from '../../stores/chatStore';
import { useBlueprintStore } from '../../stores/blueprintStore';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface BlueprintViewerProps {
  blueprintId: string;
}

const BlueprintViewer = ({ blueprintId }: BlueprintViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);

  const { messages, currentBlueprintId } = useChatStore();
  const { getBlueprint } = useBlueprintStore();
  const blueprint = getBlueprint(blueprintId);
  
  const currentMessages = currentBlueprintId ? messages[currentBlueprintId] || [] : [];
  
  // Get highlights from the most recent assistant message
  const recentMessages = [...currentMessages].reverse();
  const latestAssistantMessage = recentMessages.find(msg => msg.role === 'assistant');
  const highlights = latestAssistantMessage?.highlights || [];
  
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.25, 0.5));
  };
  
  const handleFullscreen = () => {
    if (viewerRef.current) {
      if (!isFullscreen) {
        if (viewerRef.current.requestFullscreen) {
          viewerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };
  
  const handlePrevPage = () => {
    setPage(prevPage => Math.max(prevPage - 1, 1));
  };
  
  const handleNextPage = () => {
    setPage(prevPage => Math.min(prevPage + 1, numPages));
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!blueprint) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full items-center justify-center">
        <p className="text-gray-500">No blueprint selected</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="bg-gray-100 p-3 flex items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={handlePrevPage} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">Page {page}/{numPages}</span>
          <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={page === numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={viewerRef}
        className="flex-grow overflow-hidden relative bg-gray-200"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className="absolute transition-transform duration-200"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center',
          }}
        >
          <Document
            file={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/files/${blueprintId}/content`}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
            error={
              <div className="flex items-center justify-center p-8 text-red-500">
                Failed to load PDF. Please make sure it's a valid blueprint file.
              </div>
            }
            options={{
              cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
              cMapPacked: true,
              standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/'
            }}
          >
            <Page
              pageNumber={page}
              scale={1}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }
              className="max-w-full h-auto"
            />
          </Document>
          
          {/* Render highlights */}
          {highlights.filter(h => h.page === page - 1).map((highlight, index) => (
            <div
              key={index}
              className="absolute border-2 rounded-md pointer-events-none animate-pulse"
              style={{
                left: `${highlight.x}px`,
                top: `${highlight.y}px`,
                width: `${highlight.width}px`,
                height: `${highlight.height}px`,
                backgroundColor: highlight.color,
                borderColor: highlight.color.replace('0.3', '0.7'),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlueprintViewer;