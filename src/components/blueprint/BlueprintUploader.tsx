import React, { useState, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useBlueprintStore } from '../../stores/blueprintStore';
import { motion, AnimatePresence } from 'framer-motion';

interface BlueprintUploaderProps {
  onClose: () => void;
}

const BlueprintUploader = ({ onClose }: BlueprintUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [project, setProject] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadBlueprint, uploadProgress, error } = useBlueprintStore();
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        if (!name) {
          setName(droppedFile.name.replace('.pdf', ''));
        }
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace('.pdf', ''));
      }
    }
  };
  
  const handleUpload = async () => {
    if (!file || !name) return;
    
    try {
      await uploadBlueprint(file, {
        name,
        project,
        description
      });
      
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Upload Blueprint</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              <div className="flex flex-col items-center">
                <FileText className="h-12 w-12 text-primary mb-3" />
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-lg font-medium text-gray-700">
                  Drag and drop your blueprint
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse (PDF only)
                </p>
              </div>
            )}
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="space-y-4">
            <Input
              label="Blueprint Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for this blueprint"
              required
            />
            
            <Input
              label="Project (Optional)"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="Enter project name"
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[100px]"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              isLoading={uploadProgress > 0 && uploadProgress < 100}
              disabled={!file || !name}
              onClick={handleUpload}
            >
              Upload Blueprint
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BlueprintUploader;