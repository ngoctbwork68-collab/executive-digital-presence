import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllProjects, useCreateProject, useUpdateProject, useDeleteProject, useToggleProjectPublished, useToggleProjectFeatured } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Edit, Trash2, ArrowLeft, Eye, EyeOff, Star, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Project } from '@/lib/supabase/projects';

export default function ProjectsManager() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useAllProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const togglePublished = useToggleProjectPublished();
  const toggleFeatured = useToggleProjectFeatured();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_vi: '',
    slug: '',
    description_en: '',
    description_vi: '',
    problem_en: '',
    problem_vi: '',
    action_en: '',
    action_vi: '',
    result_en: '',
    result_vi: '',
    image_url: '',
    gallery_urls: [] as string[],
    tags: [] as string[],
    project_url: '',
    project_date: '',
    published: false,
    featured: false,
    display_order: 0,
  });
  const [galleryInput, setGalleryInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editingProject) {
      setFormData({
        title_en: editingProject.title_en || '',
        title_vi: editingProject.title_vi || '',
        slug: editingProject.slug || '',
        description_en: editingProject.description_en || '',
        description_vi: editingProject.description_vi || '',
        problem_en: editingProject.problem_en || '',
        problem_vi: editingProject.problem_vi || '',
        action_en: editingProject.action_en || '',
        action_vi: editingProject.action_vi || '',
        result_en: editingProject.result_en || '',
        result_vi: editingProject.result_vi || '',
        image_url: editingProject.image_url || '',
        gallery_urls: editingProject.gallery_urls || [],
        tags: editingProject.tags || [],
        project_url: editingProject.project_url || '',
        project_date: editingProject.project_date || '',
        published: editingProject.published || false,
        featured: editingProject.featured || false,
        display_order: editingProject.display_order || 0,
      });
    } else {
      resetForm();
    }
  }, [editingProject]);

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_vi: '',
      slug: '',
      description_en: '',
      description_vi: '',
      problem_en: '',
      problem_vi: '',
      action_en: '',
      action_vi: '',
      result_en: '',
      result_vi: '',
      image_url: '',
      gallery_urls: [],
      tags: [],
      project_url: '',
      project_date: '',
      published: false,
      featured: false,
      display_order: 0,
    });
    setGalleryInput('');
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title_en || !formData.title_vi || !formData.slug) {
      toast.error('Title (both languages) and slug are required');
      return;
    }

    try {
      if (editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id,
          updates: formData,
        });
      } else {
        await createProject.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      setEditingProject(null);
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleTogglePublished = async (id: string, published: boolean) => {
    try {
      await togglePublished.mutateAsync({ id, published: !published });
    } catch (error) {
      console.error('Error toggling published:', error);
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await toggleFeatured.mutateAsync({ id, featured: !featured });
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const addGalleryUrl = () => {
    if (galleryInput.trim()) {
      setFormData(prev => ({
        ...prev,
        gallery_urls: [...prev.gallery_urls, galleryInput.trim()],
      }));
      setGalleryInput('');
    }
  };

  const removeGalleryUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Projects Manager
            </h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProject(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title_en">Title (EN) *</Label>
                        <Input
                          id="title_en"
                          value={formData.title_en}
                          onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                          placeholder="Project title in English"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title_vi">Title (VI) *</Label>
                        <Input
                          id="title_vi"
                          value={formData.title_vi}
                          onChange={(e) => setFormData(prev => ({ ...prev, title_vi: e.target.value }))}
                          placeholder="Tên dự án bằng tiếng Việt"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="project-url-slug"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="description_en">Description (EN)</Label>
                        <Textarea
                          id="description_en"
                          value={formData.description_en}
                          onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                          placeholder="Brief project description in English"
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description_vi">Description (VI)</Label>
                        <Textarea
                          id="description_vi"
                          value={formData.description_vi}
                          onChange={(e) => setFormData(prev => ({ ...prev, description_vi: e.target.value }))}
                          placeholder="Mô tả ngắn gọn về dự án"
                          rows={4}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="problem_en">Problem (EN)</Label>
                        <Textarea
                          id="problem_en"
                          value={formData.problem_en}
                          onChange={(e) => setFormData(prev => ({ ...prev, problem_en: e.target.value }))}
                          placeholder="What problem did this project solve?"
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="problem_vi">Problem (VI)</Label>
                        <Textarea
                          id="problem_vi"
                          value={formData.problem_vi}
                          onChange={(e) => setFormData(prev => ({ ...prev, problem_vi: e.target.value }))}
                          placeholder="Dự án giải quyết vấn đề gì?"
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="action_en">Action (EN)</Label>
                        <Textarea
                          id="action_en"
                          value={formData.action_en}
                          onChange={(e) => setFormData(prev => ({ ...prev, action_en: e.target.value }))}
                          placeholder="What actions were taken?"
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="action_vi">Action (VI)</Label>
                        <Textarea
                          id="action_vi"
                          value={formData.action_vi}
                          onChange={(e) => setFormData(prev => ({ ...prev, action_vi: e.target.value }))}
                          placeholder="Các hành động đã thực hiện?"
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="result_en">Result (EN)</Label>
                        <Textarea
                          id="result_en"
                          value={formData.result_en}
                          onChange={(e) => setFormData(prev => ({ ...prev, result_en: e.target.value }))}
                          placeholder="What were the measurable outcomes?"
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="result_vi">Result (VI)</Label>
                        <Textarea
                          id="result_vi"
                          value={formData.result_vi}
                          onChange={(e) => setFormData(prev => ({ ...prev, result_vi: e.target.value }))}
                          placeholder="Kết quả đo lường được là gì?"
                          rows={4}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image_url">Featured Image URL</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Gallery Images</Label>
                      <div className="flex gap-2">
                        <Input
                          value={galleryInput}
                          onChange={(e) => setGalleryInput(e.target.value)}
                          placeholder="https://example.com/gallery-image.jpg"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGalleryUrl())}
                        />
                        <Button type="button" onClick={addGalleryUrl} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.gallery_urls.map((url, index) => (
                          <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm">
                            <ImageIcon className="h-3 w-3" />
                            <span className="max-w-[200px] truncate">{url}</span>
                            <button type="button" onClick={() => removeGalleryUrl(index)} className="hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add a tag (e.g., React, UI/UX)"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag, index) => (
                          <div key={index} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                            <span>{tag}</span>
                            <button type="button" onClick={() => removeTag(index)} className="hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="project_url">Project URL</Label>
                        <Input
                          id="project_url"
                          type="url"
                          value={formData.project_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, project_url: e.target.value }))}
                          placeholder="https://project-demo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project_date">Project Date</Label>
                        <Input
                          id="project_date"
                          type="date"
                          value={formData.project_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, project_date: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="display_order">Display Order</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-md">
                      <div>
                        <Label htmlFor="published">Published</Label>
                        <p className="text-sm text-muted-foreground">Make this project visible on the website</p>
                      </div>
                      <Switch
                        id="published"
                        checked={formData.published}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-md">
                      <div>
                        <Label htmlFor="featured">Featured</Label>
                        <p className="text-sm text-muted-foreground">Show this project on the homepage</p>
                      </div>
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createProject.isPending || updateProject.isPending}>
                    {(createProject.isPending || updateProject.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4">
          {projects?.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {project.title_en}
                      {project.featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {project.published ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.title_vi}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Slug: {project.slug}
                    </p>
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFeatured(project.id, project.featured || false)}
                    >
                      <Star className={`h-4 w-4 ${project.featured ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublished(project.id, project.published || false)}
                    >
                      {project.published ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{project.title_en}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(project.id)} className="bg-destructive text-destructive-foreground">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              {(project.description_en || project.image_url) && (
                <CardContent>
                  {project.image_url && (
                    <img src={project.image_url} alt={project.title_en} className="w-full h-48 object-cover rounded-md mb-2" />
                  )}
                  {project.description_en && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description_en}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
