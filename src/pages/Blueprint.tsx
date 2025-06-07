import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import BlueprintViewer from '../components/blueprint/BlueprintViewer';
import ChatInterface from '../components/chat/ChatInterface';
import { useBlueprintStore } from '@/stores/blueprintStore';
import { formatDate } from '@/utils/date';

const Blueprint = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBlueprint, selectBlueprint } = useBlueprintStore();
  const [showChat, setShowChat] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  useEffect(() => {
    if (id) {
      const blueprint = getBlueprint(id);
      if (blueprint) {
        selectBlueprint(blueprint);
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, getBlueprint, selectBlueprint, navigate]);
  
  const blueprint = id ? getBlueprint(id) : null;
  
  if (!blueprint) {
    return null;
  }
  
  return (
    <div className="h-[calc(100vh-5rem)]">
      <div className="flex items-center space-x-4 mb-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="p-2"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{blueprint.name}</h1>
          <div className="space-y-2 text-sm text-gray-600">
            <div>Created: {formatDate(blueprint.dateUploaded)}</div>
            {blueprint.project_id && (
              <div>
                Project ID: {blueprint.project_id}
              </div>
            )}
            {blueprint.description && (
              <div>
                Description: {blueprint.description}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isMobile ? (
        <div className="h-[calc(100%-4rem)] flex flex-col">
          <div className="flex-shrink-0 mb-3">
            <div className="flex space-x-2">
              <Button 
                variant={showChat ? 'outline' : 'primary'} 
                onClick={() => setShowChat(false)}
                className="flex-1"
              >
                Blueprint
              </Button>
              <Button 
                variant={showChat ? 'primary' : 'outline'} 
                onClick={() => setShowChat(true)}
                className="flex-1"
              >
                Chat
              </Button>
            </div>
          </div>
          
          <div className="flex-grow">
            {showChat ? (
              <div className="h-full">
                <ChatInterface blueprintId={blueprint.id} />
              </div>
            ) : (
              <div className="h-full">
                <BlueprintViewer blueprintId={blueprint.id} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 h-[calc(100%-4rem)]">
          <div className="h-full">
            <BlueprintViewer blueprintId={blueprint.id} />
          </div>
          <div className="h-full">
            <ChatInterface blueprintId={blueprint.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Blueprint;