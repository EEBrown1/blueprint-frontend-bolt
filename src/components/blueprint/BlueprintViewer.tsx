import { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize, ChevronLeft, 
  ChevronRight, Download, Layers, Move
} from 'lucide-react';
import Button from '../ui/Button';
import { useChatStore, Highlight } from '../../stores/chatStore';

interface BlueprintViewerProps {
  blueprintId: string;
}

const BlueprintViewer = ({ blueprintId }: BlueprintViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);

  const { messages, currentBlueprintId } = useChatStore();
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
    setPage(prevPage => Math.max(prevPage - 1, 0));
  };
  
  const handleNextPage = () => {
    // Assume max 5 pages for demo
    setPage(prevPage => Math.min(prevPage + 1, 4));
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
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
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
          <Button variant="ghost" size="icon" onClick={handlePrevPage} disabled={page === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">Page {page + 1}/5</span>
          <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={page === 4}>
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
          {/* Sample blueprint image for demo */}
          {page === 0 && (
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/5582597/pexels-photo-5582597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Blueprint" 
                className="max-w-full"
              />
              
              {/* Render highlights */}
              {highlights.filter(h => h.page === page).map((highlight, index) => (
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
          )}
          
          {page === 1 && (
            <img 
              src="https://images.pexels.com/photos/6444/pencil-architecture-desk-ruler.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Blueprint" 
              className="max-w-full"
            />
          )}
          
          {page === 2 && (
            <img 
              src="https://images.pexels.com/photos/834892/pexels-photo-834892.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Blueprint" 
              className="max-w-full"
            />
          )}
          
          {page === 3 && (
            <div className="bg-white p-8 flex items-center justify-center rounded-md\" style={{ width: '800px', height: '600px' }}>
              <p className="text-lg text-gray-600">Sample Blueprint - Page 4</p>
            </div>
          )}
          
          {page === 4 && (
            <div className="bg-white p-8 flex items-center justify-center rounded-md" style={{ width: '800px', height: '600px' }}>
              <p className="text-lg text-gray-600">Sample Blueprint - Page 5</p>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-3 right-3 bg-white rounded-md shadow-md p-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Move className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlueprintViewer;