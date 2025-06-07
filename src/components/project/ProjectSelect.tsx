import { useState, useEffect } from 'react';
import Select from 'react-select';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '../ui/use-toast';

interface Project {
  id: string;
  name: string;
  slug: string;
}

interface ProjectOption {
  value: string;
  label: string;
}

interface ProjectSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ProjectSelect({ value, onChange, className = '' }: ProjectSelectProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', slug: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      if (!user?.id) {
        console.error('No authenticated user found');
        return;
      }
      
      setIsLoading(true);
      try {
        // First get the user's profile to confirm org_id
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('org_id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          throw new Error('Failed to fetch organization information');
        }

        if (!profile?.org_id) {
          console.error('No organization found for user');
          throw new Error('No organization found. Please contact your administrator.');
        }

        // Then fetch projects using both created_by and org_id to match RLS policy
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, slug')
          .eq('created_by', user.id)
          .eq('org_id', profile.org_id);

        if (error) {
          console.error('Error fetching projects:', error);
          throw error;
        }

        console.log('Projects fetched successfully:', data);
        if (data?.length === 0) {
          console.log('No projects found for user');
          toast({
            title: 'No Projects',
            description: 'No projects found. Create a new project to get started.',
          });
        }
        setProjects(data || []);
      } catch (error) {
        console.error('Error in fetchProjects:', error);
        let errorMessage = 'Failed to load projects. Please try again.';
        
        if (error instanceof Error) {
          if (error.message.includes('organization')) {
            errorMessage = 'Organization not found. Please contact your administrator.';
          } else if (error.message.includes('permission')) {
            errorMessage = 'You do not have permission to view projects.';
          } else if (error.message.includes('authentication')) {
            errorMessage = 'Please log in again to view projects.';
          } else {
            errorMessage = error.message;
          }
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, [user?.id]);

  // Convert projects to react-select options
  const options: ProjectOption[] = projects.map(project => ({
    value: project.id,
    label: project.name
  }));

  // Add no-options message
  const noOptionsMessage = () => {
    if (isLoading) return 'Loading projects...';
    return 'No projects found. Create a new project to get started.';
  };

  // Handle project creation
  const handleCreateProject = async (e: React.FormEvent) => {
    console.log('handleCreateProject called');
    e.preventDefault();
    
    if (!user) {
      console.error('No user found');
      toast({
        title: 'Error',
        description: 'You must be logged in to create a project.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newProject.name || !newProject.slug) {
      console.error('Missing required fields:', { name: newProject.name, slug: newProject.slug });
      toast({
        title: 'Error',
        description: 'Project name and slug are required.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Fetching user profile...');
    setIsCreating(true);
    
    try {
      // First fetch the user's org_id from their profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Failed to fetch organization information');
      }

      if (!profile?.org_id) {
        console.error('No organization found for user');
        throw new Error('No organization found. Please contact your administrator.');
      }

      console.log('Creating project:', { ...newProject, org_id: profile.org_id });

      console.log('Sending request to Supabase...');
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProject.name,
          slug: newProject.slug,
          org_id: profile.org_id,
          created_by: user.id
        })
        .select('id, name, slug')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Project created successfully:', data);
      setProjects(prev => [...prev, data]);
      onChange(data.id);
      setIsModalOpen(false);
      setNewProject({ name: '', slug: '' });
      
      toast({
        title: 'Success',
        description: 'Project created successfully!',
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Generate slug from project name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="project">Project</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            id="project"
            value={options.find(opt => opt.value === value)}
            onChange={(option) => onChange(option?.value || '')}
            options={options}
            isLoading={isLoading}
            placeholder="Select a project"
            noOptionsMessage={noOptionsMessage}
            loadingMessage={() => "Loading projects..."}
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button">
              + Create
            </Button>
          </DialogTrigger>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={newProject.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewProject(prev => ({
                      ...prev,
                      name,
                      slug: generateSlug(name)
                    }));
                  }}
                  placeholder="Enter project name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectSlug">Project Slug</Label>
                <Input
                  id="projectSlug"
                  value={newProject.slug}
                  onChange={(e) => {
                    const slugPattern = /^[a-z0-9-]+$/;
                    const value = e.target.value.toLowerCase();
                    if (value === '' || slugPattern.test(value)) {
                      setNewProject(prev => ({ ...prev, slug: value }));
                    }
                  }}
                  placeholder="project-slug"
                  title="Only lowercase letters, numbers, and hyphens are allowed"
                />
                <p className="text-sm text-gray-500">
                  Used in URLs. Only lowercase letters, numbers, and hyphens.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !newProject.name || !newProject.slug}
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 