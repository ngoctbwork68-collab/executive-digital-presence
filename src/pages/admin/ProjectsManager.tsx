import { useState, useEffect } from 'react';
import { slugify } from '@/lib/slugify';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useAllProjects, useCreateProject, useUpdateProject, useDeleteProject, useToggleProjectFeatured } from '@/hooks/useProjects';
import { useReorderItems } from '@/hooks/useReorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Pencil, Trash2, X, ImageIcon } from 'lucide-react';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableRow } from '@/components/admin/SortableRow';
import type { Project, ProjectInsert, ProjectUpdate } from '@/lib/supabase/projects';

export default function ProjectsManager() {
  const { data: projects, isLoading } = useAllProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const toggleFeatured = useToggleProjectFeatured();
  const reorder = useReorderItems('projects');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', category: '', full_description: '', challenge: '', solution: '',
    image_url: '', link: '', technologies: [] as string[], featured: false, published: true, sort_order: 0,
  });
  const [techInput, setTechInput] = useState('');
  const [localItems, setLocalItems] = useState<Project[]>([]);

  useEffect(() => { if (projects) setLocalItems(projects); }, [projects]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localItems.findIndex(i => i.id === active.id);
    const newIndex = localItems.findIndex(i => i.id === over.id);
    const newItems = arrayMove(localItems, oldIndex, newIndex);
    setLocalItems(newItems);
    reorder.mutate(newItems.map((item, i) => ({ id: item.id, sort_order: i })));
  };

  useEffect(() => {
    if (editingProject) {
      setFormData({
        title: editingProject.title, slug: editingProject.slug || '', description: editingProject.description,
        category: editingProject.category, full_description: editingProject.full_description || '',
        challenge: editingProject.challenge || '', solution: editingProject.solution || '',
        image_url: editingProject.image_url || '', link: editingProject.link || '',
        technologies: editingProject.technologies || [], featured: editingProject.featured || false,
        published: (editingProject as Project & { published?: boolean }).published ?? true,
        sort_order: editingProject.sort_order || 0,
      });
    } else { resetForm(); }
  }, [editingProject]);

  const resetForm = () => {
    setFormData({ title: '', slug: '', description: '', category: '', full_description: '', challenge: '', solution: '', image_url: '', link: '', technologies: [], featured: false, published: true, sort_order: 0 });
    setTechInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Tiêu đề, mô tả và danh mục là bắt buộc');
      return;
    }
    try {
      if (editingProject) {
        await updateProject.mutateAsync({ id: editingProject.id, updates: formData as ProjectUpdate });
      } else {
        await createProject.mutateAsync(formData as ProjectInsert);
      }
      setIsDialogOpen(false);
      setEditingProject(null);
      resetForm();
    } catch (error) { console.error('Error:', error); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      await deleteProject.mutateAsync(id);
    }
  };

  const addTech = () => {
    if (techInput.trim()) {
      setFormData(prev => ({ ...prev, technologies: [...prev.technologies, techInput.trim()] }));
      setTechInput('');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý dự án</h1>
          <p className="text-sm text-muted-foreground">Kéo thả để sắp xếp thứ tự hiển thị</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingProject(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Thêm dự án</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingProject ? 'Sửa dự án' : 'Thêm dự án'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Ảnh bìa dự án</Label>
                {formData.image_url ? (
                  <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden group border border-border">
                    <img src={formData.image_url} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button type="button" size="sm" variant="secondary" className="shadow-lg" onClick={() => setFormData(p => ({ ...p, image_url: '' }))}><X className="h-4 w-4 mr-1" /> Xóa ảnh</Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-[21/9] rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><ImageIcon className="h-6 w-6 text-primary/60" /></div>
                    <p className="text-sm text-muted-foreground">Tải lên ảnh bìa dự án</p>
                  </div>
                )}
                <div className="mt-2"><MediaUpload label="" value={formData.image_url} onChange={(url) => setFormData(p => ({ ...p, image_url: url }))} accept="image/*" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tiêu đề *</Label><Input value={formData.title} onChange={(e) => { const title = e.target.value; setFormData(p => ({ ...p, title, slug: editingProject ? p.slug : slugify(title) })); }} required /></div>
                <div><Label>Slug</Label><Input value={formData.slug} onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))} placeholder="tu-dong-tao-tu-tieu-de" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Danh mục *</Label><Input value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} required /></div>
                <div><Label>Link</Label><Input value={formData.link} onChange={(e) => setFormData(p => ({ ...p, link: e.target.value }))} /></div>
              </div>
              <div><Label>Mô tả ngắn *</Label><Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} required /></div>
              <div><Label>Mô tả chi tiết</Label><RichTextEditor content={formData.full_description} onChange={(html) => setFormData(p => ({ ...p, full_description: html }))} /></div>
              <div><Label>Thách thức</Label><RichTextEditor content={formData.challenge} onChange={(html) => setFormData(p => ({ ...p, challenge: html }))} /></div>
              <div><Label>Giải pháp</Label><RichTextEditor content={formData.solution} onChange={(html) => setFormData(p => ({ ...p, solution: html }))} /></div>
              <div>
                <Label>Công nghệ</Label>
                <div className="flex gap-2 mb-2">
                  <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="React, Node.js..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())} />
                  <Button type="button" onClick={addTech}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech, i) => (
                    <div key={i} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      <span>{tech}</span>
                      <button type="button" onClick={() => setFormData(p => ({ ...p, technologies: p.technologies.filter((_, j) => j !== i) }))}><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch checked={formData.published} onCheckedChange={(checked) => setFormData(p => ({ ...p, published: checked }))} />
                  <Label>Xuất bản</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={formData.featured} onCheckedChange={(checked) => setFormData(p => ({ ...p, featured: checked }))} />
                  <Label>Nổi bật</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit">{editingProject ? 'Cập nhật' : 'Tạo mới'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Xuất bản</TableHead>
              <TableHead>Nổi bật</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {localItems.map((project) => (
                  <SortableRow key={project.id} id={project.id}>
                    <TableCell>
                      {project.image_url ? (
                        <div className="w-12 h-8 rounded overflow-hidden border border-border"><img src={project.image_url} alt="" className="w-full h-full object-cover" /></div>
                      ) : (
                        <div className="w-12 h-8 rounded bg-muted flex items-center justify-center border border-border"><ImageIcon className="h-4 w-4 text-muted-foreground/40" /></div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>{project.category}</TableCell>
                    <TableCell>
                      <Switch checked={(project as Project & { published?: boolean }).published ?? true} onCheckedChange={(c) => updateProject.mutate({ id: project.id, updates: { published: c } as ProjectUpdate })} />
                    </TableCell>
                    <TableCell>
                      <Switch checked={project.featured || false} onCheckedChange={() => toggleFeatured.mutate({ id: project.id, featured: !project.featured })} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingProject(project); setIsDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(project.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </SortableRow>
                ))}
              </TableBody>
            </SortableContext>
          </DndContext>
        </Table>
      </div>
    </div>
  );
}
