import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import { ProjectSelect } from '../project/ProjectSelect';

interface BlueprintUploaderProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function BlueprintUploader({ onClose, onSuccess }: BlueprintUploaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !name || !user) return;

    try {
      const docId = crypto.randomUUID();
      const { error: uploadError } = await supabase.storage
        .from('blueprints')
        .upload(`documents/${docId}.pdf`, file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('pdf_documents')
        .insert({
          id: docId,
          name,
          description,
          project_id: projectId || null,
          storage_path: `documents/${docId}.pdf`,
          uploaded_by: user.id
        });

      if (insertError) {
        // Cleanup uploaded file if document insert fails
        await supabase.storage
          .from('blueprints')
          .remove([`documents/${docId}.pdf`]);
        throw insertError;
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload blueprint. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Log state changes
  useEffect(() => {
    console.log('State updated:', {
      file: file ? { name: file.name, type: file.type, size: file.size } : null,
      name,
      user: user ? { id: user.id } : null,
      projectId
    });
  }, [file, name, user, projectId]);

  // Compute disabled state
  const isUploadDisabled = !file || !name || !user;
  
  // Log disabled state computation
  useEffect(() => {
    console.log('Upload disabled check:', {
      hasFile: !!file,
      fileName: file?.name,
      hasName: !!name,
      nameValue: name,
      hasUser: !!user,
      userId: user?.id,
      isDisabled: isUploadDisabled
    });
  }, [file, name, user]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="blueprintName">Name</Label>
        <Input
          id="blueprintName"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="Enter blueprint name"
        />
      </div>
      
      <ProjectSelect
        value={projectId}
        onChange={setProjectId}
      />

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          placeholder="Enter blueprint description"
          rows={3}
        />
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setFile(e.target.files[0]);
            }
          }}
        />
        {file ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">{file.name}</p>
            <Button
              variant="outline"
              onClick={() => setFile(null)}
              type="button"
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p>Drag and drop your PDF here, or</p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Browse Files
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={isUploadDisabled}
          type="button"
        >
          Upload
        </Button>
      </div>
    </div>
  );
}