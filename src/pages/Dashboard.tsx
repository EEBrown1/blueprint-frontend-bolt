import { useState } from 'react';
import { PlusCircle, Search, Filter } from 'lucide-react';
import Button from '../components/ui/Button';
import BlueprintCard from '../components/blueprint/BlueprintCard';
import BlueprintUploader from '../components/blueprint/BlueprintUploader';
import { useBlueprintStore } from '../stores/blueprintStore';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { blueprints, deleteBlueprint } = useBlueprintStore();
  
  const filteredBlueprints = blueprints.filter(
    (blueprint) => 
      blueprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blueprint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blueprint.project?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleDeleteBlueprint = (id: string) => {
    if (window.confirm('Are you sure you want to delete this blueprint?')) {
      deleteBlueprint(id);
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Blueprints</h1>
          <p className="text-gray-600 mt-1">
            Manage and interact with your uploaded blueprints
          </p>
        </div>
        <Button onClick={() => setShowUploader(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Upload Blueprint
        </Button>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search blueprints..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="sm:w-auto w-full">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>
      
      {filteredBlueprints.length === 0 && searchQuery !== '' ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">
            No blueprints match your search query "{searchQuery}".
          </p>
        </div>
      ) : filteredBlueprints.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blueprints yet</h3>
          <p className="text-gray-600 mb-6">
            Upload your first blueprint to get started.
          </p>
          <Button onClick={() => setShowUploader(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Upload Blueprint
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlueprints.map((blueprint) => (
            <BlueprintCard
              key={blueprint.id}
              blueprint={blueprint}
              onDelete={handleDeleteBlueprint}
            />
          ))}
        </div>
      )}
      
      <AnimatePresence>
        {showUploader && (
          <BlueprintUploader onClose={() => setShowUploader(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;