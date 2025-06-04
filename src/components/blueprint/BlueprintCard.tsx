import { Link } from 'react-router-dom';
import { Eye, Trash2, Calendar } from 'lucide-react';
import { Blueprint } from '../../stores/blueprintStore';
import { formatDate, truncateText } from '../../lib/utils';
import { motion } from 'framer-motion';

interface BlueprintCardProps {
  blueprint: Blueprint;
  onDelete: (id: string) => void;
}

const BlueprintCard = ({ blueprint, onDelete }: BlueprintCardProps) => {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-40 overflow-hidden bg-gray-200">
        <img 
          src={blueprint.thumbnail} 
          alt={blueprint.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {blueprint.status === 'processing' && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center">
            <div className="text-white text-center px-3">
              <div className="animate-pulse mb-2">Processing</div>
              <div className="w-full bg-gray-400 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full w-2/3 animate-[progress_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{blueprint.name}</h3>
        {blueprint.description && (
          <p className="text-gray-600 text-sm mb-3">
            {truncateText(blueprint.description, 80)}
          </p>
        )}
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Uploaded {formatDate(blueprint.dateUploaded)}</span>
        </div>
        
        {blueprint.project && (
          <div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700 mb-3">
            {blueprint.project}
          </div>
        )}
      </div>
      
      <div className="p-4 pt-0 flex justify-between items-center border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {blueprint.pageCount} {blueprint.pageCount === 1 ? 'page' : 'pages'}
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => onDelete(blueprint.id)}
            className="p-1.5 text-gray-500 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
            aria-label="Delete blueprint"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          
          <Link 
            to={`/blueprint/${blueprint.id}`}
            className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
            aria-label="View blueprint"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BlueprintCard;