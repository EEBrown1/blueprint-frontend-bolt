import { useState, useRef, useEffect } from 'react';
import { Component, type ReactNode } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize, ChevronLeft, 
  ChevronRight, Download, Layers, Move
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from '../ui/Button';
import { useChatStore } from '../../stores/chatStore';
import { useBlueprintStore } from '../../stores/blueprintStore';
import { useAnnotationStore } from '../../stores/annotationStore';
import AnnotationToolbar, { AnnotationTool } from './AnnotationToolbar';

// Error boundary for PDF rendering
class PDFErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-8 text-red-500">
          Failed to render PDF. Please try refreshing the page.
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>('cursor');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadingTaskRef = useRef<PDFDocumentProxy | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const { getBlueprint } = useBlueprintStore();
  const { 
    annotations, 
    addAnnotation, 
    updateAnnotation,
    selectedAnnotation,
    selectAnnotation 
  } = useAnnotationStore();

  const blueprint = getBlueprint(blueprintId);
  const currentAnnotations = annotations[blueprintId]?.filter(a => a.page === page) || [];
  
  // Initialize PDF.js worker
  useEffect(() => {
    try {
      const worker = new pdfWorker();
      workerRef.current = worker;
      pdfjs.GlobalWorkerOptions.workerPort = worker;
      console.log('✅ PDF.js worker initialized with self-hosted worker:', pdfjs.version);
      setIsWorkerReady(true);
    } catch (error) {
      console.error('❌ PDF.js worker initialization failed:', error);
      setIsWorkerReady(false);
    }

    // Cleanup worker and loading task on unmount
    return () => {
      if (loadingTaskRef.current) {
        loadingTaskRef.current.destroy().catch((err: Error) => {
          console.error('Error cleaning up PDF loading task:', err);
        });
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleToolSelect = (tool: AnnotationTool) => {
    setSelectedTool(tool);
    selectAnnotation(null);
  };

  const getRelativeCoordinates = (e: React.MouseEvent) => {
    const rect = viewerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    return {
      x: (e.clientX - rect.left - position.x) / zoom,
      y: (e.clientY - rect.top - position.y) / zoom
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getRelativeCoordinates(e);

    switch (selectedTool) {
      case 'cursor':
        setIsDragging(true);
        setStartPosition({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        });
        break;

      case 'sticky':
        addAnnotation(blueprintId, {
          type: 'sticky',
          page,
          position: coords,
          content: '',
          color: '#FFE4B5'
        });
        break;

      case 'pen':
        setIsDrawing(true);
        setCurrentPath([coords]);
        break;

      case 'ruler':
        addAnnotation(blueprintId, {
          type: 'ruler',
          page,
          start: coords,
          end: coords,
          measurement: '0 px'
        });
        break;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getRelativeCoordinates(e);

    if (isDragging && selectedTool === 'cursor') {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y
      });
    } else if (isDrawing && selectedTool === 'pen') {
      setCurrentPath(prev => [...prev, coords]);
    } else if (selectedTool === 'ruler' && selectedAnnotation) {
      const annotation = currentAnnotations.find(a => a.id === selectedAnnotation);
      if (annotation?.type === 'ruler') {
        const dx = coords.x - annotation.start.x;
        const dy = coords.y - annotation.start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        updateAnnotation(blueprintId, selectedAnnotation, {
          end: coords,
          measurement: `${Math.round(distance)} px`
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath.length > 1) {
      addAnnotation(blueprintId, {
        type: 'pen',
        page,
        points: currentPath,
        color: '#000000',
        width: 2
      });
    }
    setIsDragging(false);
    setIsDrawing(false);
    setCurrentPath([]);
  };

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

  const onDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
    setIsLoading(false);
    loadingTaskRef.current = pdf;
  };

  const onLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
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

  const getCursor = () => {
    if (selectedTool === 'cursor') {
      return isDragging ? 'grabbing' : 'grab';
    }
    switch (selectedTool) {
      case 'sticky':
      case 'pen':
      case 'ruler':
        return 'crosshair';
      case 'eraser':
        return 'not-allowed';
      default:
        return 'default';
    }
  };

  if (!blueprint) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full items-center justify-center">
        <p className="text-gray-500">No blueprint selected</p>
      </div>
    );
  }
  
  return (
    <PDFErrorBoundary>
      <div 
        ref={viewerRef} 
        className={`relative w-full h-full overflow-hidden bg-gray-100 ${
          isFullscreen ? 'fixed inset-0 z-50' : ''
        }`}
      >
        {!isWorkerReady ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">Initializing PDF viewer...</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">Loading PDF...</p>
            </div>
          </div>
        ) : null}

        <div className="absolute top-4 left-4 z-10 flex space-x-2">
          <Button variant="ghost" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="absolute top-4 right-4 z-10 flex space-x-1">
          <Button variant="ghost" size="icon" onClick={handlePrevPage} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">Page {page}/{numPages}</span>
          <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={page === numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="absolute top-4 right-16 z-10 flex space-x-1">
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        <div 
          className="relative w-full h-full overflow-auto"
          style={{ 
            transform: `scale(${zoom})`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {isWorkerReady && (
            <Document
              file={blueprint.fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onLoadError}
              loading={
                <div className="flex items-center justify-center w-full h-full">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }
              error={
                <div className="flex items-center justify-center p-8 text-red-500">
                  Failed to load PDF. Please make sure it's a valid blueprint file.
                </div>
              }
              options={{
                cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
                cMapPacked: true,
                standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`
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

              {/* Render annotations */}
              {currentAnnotations.map((annotation) => (
                <div key={annotation.id}>
                  {annotation.type === 'sticky' && (
                    <div
                      className="absolute bg-yellow-100 p-2 rounded shadow-md"
                      style={{
                        left: annotation.position.x,
                        top: annotation.position.y,
                        backgroundColor: annotation.color,
                        minWidth: '150px',
                        minHeight: '100px'
                      }}
                    >
                      <textarea
                        className="w-full h-full bg-transparent resize-none"
                        value={annotation.content}
                        onChange={(e) => 
                          updateAnnotation(blueprintId, annotation.id, {
                            content: e.target.value
                          })
                        }
                        placeholder="Add note..."
                      />
                    </div>
                  )}

                  {annotation.type === 'pen' && (
                    <svg
                      className="absolute top-0 left-0 pointer-events-none"
                      style={{
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      <path
                        d={`M ${annotation.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                        stroke={annotation.color}
                        strokeWidth={annotation.width}
                        fill="none"
                      />
                    </svg>
                  )}

                  {annotation.type === 'ruler' && (
                    <svg
                      className="absolute top-0 left-0 pointer-events-none"
                      style={{
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      <line
                        x1={annotation.start.x}
                        y1={annotation.start.y}
                        x2={annotation.end.x}
                        y2={annotation.end.y}
                        stroke="#000"
                        strokeWidth="2"
                      />
                      <text
                        x={(annotation.start.x + annotation.end.x) / 2}
                        y={(annotation.start.y + annotation.end.y) / 2}
                        fill="#000"
                        fontSize="12"
                        textAnchor="middle"
                        dy="-5"
                      >
                        {annotation.measurement}
                      </text>
                    </svg>
                  )}
                </div>
              ))}

              {/* Render current drawing path */}
              {isDrawing && currentPath.length > 1 && (
                <svg
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <path
                    d={`M ${currentPath.map(p => `${p.x},${p.y}`).join(' L ')}`}
                    stroke="#000"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              )}
            </Document>
          )}

          {/* Annotation Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 pointer-events-none"
          />
        </div>

        {/* Annotation Toolbar */}
        <AnnotationToolbar
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
        />
      </div>
    </PDFErrorBoundary>
  );
};

export default BlueprintViewer;