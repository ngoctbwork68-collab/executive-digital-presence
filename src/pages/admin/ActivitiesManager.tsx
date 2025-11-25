import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useAllActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useToggleActivityPublished,
  useToggleActivityFeatured
} from '@/hooks/useActivities';
import type { ActivityInsert, ActivityUpdate } from '@/lib/supabase/activities';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ActivitiesManager() {
  const navigate = useNavigate();
  const { data: activities, isLoading } = useAllActivities();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const togglePublished = useToggleActivityPublished();
  const toggleFeatured = useToggleActivityFeatured();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ActivityInsert>>({
    title_en: '',
    title_vi: '',
    organization_en: '',
    organization_vi: '',
    role_en: '',
    role_vi: '',
    description_en: '',
    description_vi: '',
    start_date: '',
    end_date: null,
    image_url: '',
    achievements_en: [],
    achievements_vi: [],
    published: false,
    featured: false,
    display_order: 0,
  });

  const [newAchievementEn, setNewAchievementEn] = useState('');
  const [newAchievementVi, setNewAchievementVi] = useState('');

  const handleEdit = (activity: any) => {
    setEditingId(activity.id);
    setFormData({
      title_en: activity.title_en,
      title_vi: activity.title_vi,
      organization_en: activity.organization_en,
      organization_vi: activity.organization_vi,
      role_en: activity.role_en || '',
      role_vi: activity.role_vi || '',
      description_en: activity.description_en || '',
      description_vi: activity.description_vi || '',
      start_date: activity.start_date,
      end_date: activity.end_date,
      image_url: activity.image_url || '',
      achievements_en: activity.achievements_en || [],
      achievements_vi: activity.achievements_vi || [],
      published: activity.published,
      featured: activity.featured,
      display_order: activity.display_order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      await deleteActivity.mutateAsync(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_en || !formData.title_vi || !formData.organization_en || !formData.organization_vi || !formData.start_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        await updateActivity.mutateAsync({
          id: editingId,
          updates: formData as ActivityUpdate,
        });
      } else {
        await createActivity.mutateAsync(formData as ActivityInsert);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title_en: '',
      title_vi: '',
      organization_en: '',
      organization_vi: '',
      role_en: '',
      role_vi: '',
      description_en: '',
      description_vi: '',
      start_date: '',
      end_date: null,
      image_url: '',
      achievements_en: [],
      achievements_vi: [],
      published: false,
      featured: false,
      display_order: 0,
    });
    setNewAchievementEn('');
    setNewAchievementVi('');
  };

  const addAchievement = (lang: 'en' | 'vi') => {
    const value = lang === 'en' ? newAchievementEn : newAchievementVi;
    if (!value.trim()) return;

    const key = lang === 'en' ? 'achievements_en' : 'achievements_vi';
    setFormData({
      ...formData,
      [key]: [...(formData[key] || []), value],
    });

    if (lang === 'en') {
      setNewAchievementEn('');
    } else {
      setNewAchievementVi('');
    }
  };

  const removeAchievement = (lang: 'en' | 'vi', index: number) => {
    const key = lang === 'en' ? 'achievements_en' : 'achievements_vi';
    const achievements = [...(formData[key] || [])];
    achievements.splice(index, 1);
    setFormData({ ...formData, [key]: achievements });
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
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activities Manager</h1>
            <Button variant="link" onClick={() => navigate('/admin/dashboard')} className="px-0">
              ← Back to Dashboard
            </Button>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Title (EN)</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities?.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.display_order}</TableCell>
                    <TableCell>{activity.title_en}</TableCell>
                    <TableCell>{activity.organization_en}</TableCell>
                    <TableCell>
                      {activity.start_date} - {activity.end_date || 'Present'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={activity.published || false}
                        onCheckedChange={(checked) =>
                          togglePublished.mutate({ id: activity.id, published: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={activity.featured || false}
                        onCheckedChange={(checked) =>
                          toggleFeatured.mutate({ id: activity.id, featured: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(activity)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Activity' : 'Add New Activity'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title_en">Title (English) *</Label>
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="e.g., Youth Leadership Program"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title_vi">Title (Vietnamese) *</Label>
                  <Input
                    id="title_vi"
                    value={formData.title_vi}
                    onChange={(e) => setFormData({ ...formData, title_vi: e.target.value })}
                    placeholder="Ví dụ: Chương trình Lãnh đạo Trẻ"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organization_en">Organization (English) *</Label>
                  <Input
                    id="organization_en"
                    value={formData.organization_en}
                    onChange={(e) => setFormData({ ...formData, organization_en: e.target.value })}
                    placeholder="e.g., United Nations"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="organization_vi">Organization (Vietnamese) *</Label>
                  <Input
                    id="organization_vi"
                    value={formData.organization_vi}
                    onChange={(e) => setFormData({ ...formData, organization_vi: e.target.value })}
                    placeholder="Ví dụ: Liên Hợp Quốc"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role_en">Role (English)</Label>
                  <Input
                    id="role_en"
                    value={formData.role_en}
                    onChange={(e) => setFormData({ ...formData, role_en: e.target.value })}
                    placeholder="e.g., Program Coordinator"
                  />
                </div>

                <div>
                  <Label htmlFor="role_vi">Role (Vietnamese)</Label>
                  <Input
                    id="role_vi"
                    value={formData.role_vi}
                    onChange={(e) => setFormData({ ...formData, role_vi: e.target.value })}
                    placeholder="Ví dụ: Điều phối viên Chương trình"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description_en">Description (English)</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    placeholder="Brief description of the activity"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="description_vi">Description (Vietnamese)</Label>
                  <Textarea
                    id="description_vi"
                    value={formData.description_vi}
                    onChange={(e) => setFormData({ ...formData, description_vi: e.target.value })}
                    placeholder="Mô tả ngắn gọn về hoạt động"
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Achievements (English)</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newAchievementEn}
                      onChange={(e) => setNewAchievementEn(e.target.value)}
                      placeholder="Add achievement..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement('en'))}
                    />
                    <Button type="button" onClick={() => addAchievement('en')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.achievements_en?.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="flex-1">{achievement}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAchievement('en', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Achievements (Vietnamese)</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newAchievementVi}
                      onChange={(e) => setNewAchievementVi(e.target.value)}
                      placeholder="Thêm thành tựu..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement('vi'))}
                    />
                    <Button type="button" onClick={() => addAchievement('vi')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.achievements_vi?.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="flex-1">{achievement}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAchievement('vi', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createActivity.isPending || updateActivity.isPending}>
                  {(createActivity.isPending || updateActivity.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
