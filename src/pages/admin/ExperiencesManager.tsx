import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllExperiences, useCreateExperience, useUpdateExperience, useDeleteExperience, useToggleExperiencePublished } from '@/hooks/useExperiences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { toast } from 'sonner';
import type { Experience, ExperienceInsert, ExperienceUpdate } from '@/lib/supabase/experiences';

export default function ExperiencesManager() {
  const navigate = useNavigate();
  const { data: experiences = [], isLoading } = useAllExperiences();
  const createMutation = useCreateExperience();
  const updateMutation = useUpdateExperience();
  const deleteMutation = useDeleteExperience();
  const togglePublishedMutation = useToggleExperiencePublished();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState<Partial<ExperienceInsert>>({
    title_en: '',
    title_vi: '',
    company_en: '',
    company_vi: '',
    location: '',
    description_en: '',
    description_vi: '',
    start_date: '',
    end_date: '',
    is_current: false,
    achievements_en: [],
    achievements_vi: [],
    image_url: '',
    published: false,
    display_order: 0,
  });

  const [achievementInputEn, setAchievementInputEn] = useState('');
  const [achievementInputVi, setAchievementInputVi] = useState('');

  const handleOpenDialog = (experience?: Experience) => {
    if (experience) {
      setEditingExperience(experience);
      setFormData({
        title_en: experience.title_en,
        title_vi: experience.title_vi,
        company_en: experience.company_en,
        company_vi: experience.company_vi,
        location: experience.location || '',
        description_en: experience.description_en || '',
        description_vi: experience.description_vi || '',
        start_date: experience.start_date,
        end_date: experience.end_date || '',
        is_current: experience.is_current || false,
        achievements_en: experience.achievements_en || [],
        achievements_vi: experience.achievements_vi || [],
        image_url: experience.image_url || '',
        published: experience.published || false,
        display_order: experience.display_order || 0,
      });
    } else {
      setEditingExperience(null);
      setFormData({
        title_en: '',
        title_vi: '',
        company_en: '',
        company_vi: '',
        location: '',
        description_en: '',
        description_vi: '',
        start_date: '',
        end_date: '',
        is_current: false,
        achievements_en: [],
        achievements_vi: [],
        image_url: '',
        published: false,
        display_order: 0,
      });
    }
    setAchievementInputEn('');
    setAchievementInputVi('');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExperience(null);
    setFormData({
      title_en: '',
      title_vi: '',
      company_en: '',
      company_vi: '',
      location: '',
      description_en: '',
      description_vi: '',
      start_date: '',
      end_date: '',
      is_current: false,
      achievements_en: [],
      achievements_vi: [],
      image_url: '',
      published: false,
      display_order: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_en || !formData.title_vi || !formData.company_en || !formData.company_vi || !formData.start_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingExperience) {
        await updateMutation.mutateAsync({
          id: editingExperience.id,
          updates: formData as ExperienceUpdate,
        });
      } else {
        await createMutation.mutateAsync(formData as ExperienceInsert);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving experience:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting experience:', error);
      }
    }
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      await togglePublishedMutation.mutateAsync({ id, published: !currentStatus });
    } catch (error) {
      console.error('Error toggling published status:', error);
    }
  };

  const addAchievement = (lang: 'en' | 'vi') => {
    const input = lang === 'en' ? achievementInputEn : achievementInputVi;
    if (!input.trim()) return;

    const field = lang === 'en' ? 'achievements_en' : 'achievements_vi';
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), input.trim()],
    }));

    if (lang === 'en') {
      setAchievementInputEn('');
    } else {
      setAchievementInputVi('');
    }
  };

  const removeAchievement = (lang: 'en' | 'vi', index: number) => {
    const field = lang === 'en' ? 'achievements_en' : 'achievements_vi';
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Experiences Manager</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingExperience ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_en">Position Title (EN) *</Label>
                    <Input
                      id="title_en"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      placeholder="e.g., Senior Product Manager"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title_vi">Position Title (VI) *</Label>
                    <Input
                      id="title_vi"
                      value={formData.title_vi}
                      onChange={(e) => setFormData({ ...formData, title_vi: e.target.value })}
                      placeholder="e.g., Trưởng Phòng Sản Phẩm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_en">Company Name (EN) *</Label>
                    <Input
                      id="company_en"
                      value={formData.company_en}
                      onChange={(e) => setFormData({ ...formData, company_en: e.target.value })}
                      placeholder="e.g., ABC Corporation"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_vi">Company Name (VI) *</Label>
                    <Input
                      id="company_vi"
                      value={formData.company_vi}
                      onChange={(e) => setFormData({ ...formData, company_vi: e.target.value })}
                      placeholder="e.g., Tập Đoàn ABC"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Ho Chi Minh City, Vietnam"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      disabled={formData.is_current}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_current"
                    checked={formData.is_current}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_current: checked, end_date: checked ? '' : formData.end_date })}
                  />
                  <Label htmlFor="is_current">Current Position</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description_en">Description (EN)</Label>
                    <Textarea
                      id="description_en"
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      placeholder="Describe your role and responsibilities"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description_vi">Description (VI)</Label>
                    <Textarea
                      id="description_vi"
                      value={formData.description_vi}
                      onChange={(e) => setFormData({ ...formData, description_vi: e.target.value })}
                      placeholder="Mô tả vai trò và trách nhiệm"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Achievements (EN)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={achievementInputEn}
                        onChange={(e) => setAchievementInputEn(e.target.value)}
                        placeholder="Add an achievement"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement('en'))}
                      />
                      <Button type="button" onClick={() => addAchievement('en')}>Add</Button>
                    </div>
                    <div className="space-y-1 mt-2">
                      {formData.achievements_en?.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <span className="flex-1 text-sm">{achievement}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAchievement('en', index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Achievements (VI)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={achievementInputVi}
                        onChange={(e) => setAchievementInputVi(e.target.value)}
                        placeholder="Thêm thành tích"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement('vi'))}
                      />
                      <Button type="button" onClick={() => addAchievement('vi')}>Add</Button>
                    </div>
                    <div className="space-y-1 mt-2">
                      {formData.achievements_vi?.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <span className="flex-1 text-sm">{achievement}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAchievement('vi', index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <MediaUpload
                  label="Company Logo"
                  value={formData.image_url || ''}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  accept="image/*"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                    />
                    <Label htmlFor="published">Published</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingExperience ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading experiences...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.map((experience) => (
                <TableRow key={experience.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{experience.title_en}</div>
                      <div className="text-sm text-muted-foreground">{experience.title_vi}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{experience.company_en}</div>
                      <div className="text-sm text-muted-foreground">{experience.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(experience.start_date).toLocaleDateString()} - 
                      {experience.is_current ? ' Present' : experience.end_date ? ` ${new Date(experience.end_date).toLocaleDateString()}` : ' N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {experience.is_current && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        Current
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublished(experience.id, experience.published || false)}
                    >
                      {experience.published ? (
                        <Eye className="h-4 w-4 text-primary" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(experience)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(experience.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
