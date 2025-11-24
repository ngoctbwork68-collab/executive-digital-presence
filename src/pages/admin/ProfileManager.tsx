import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function ProfileManager() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    title_en: '',
    title_vi: '',
    tagline_en: '',
    tagline_vi: '',
    summary_en: '',
    summary_vi: '',
    story_en: '',
    story_vi: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        title_en: profile.title_en || '',
        title_vi: profile.title_vi || '',
        tagline_en: profile.tagline_en || '',
        tagline_vi: profile.tagline_vi || '',
        summary_en: profile.summary_en || '',
        summary_vi: profile.summary_vi || '',
        story_en: profile.story_en || '',
        story_vi: profile.story_vi || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        twitter_url: profile.twitter_url || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);

    try {
      // For now, we'll use a placeholder. You can implement Supabase Storage later
      const imageUrl = URL.createObjectURL(file);
      handleInputChange('avatar_url', imageUrl);
      toast.success('Image uploaded (local preview)');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (profile) {
        const { error } = await supabase
          .from('profile')
          .update(formData)
          .eq('id', profile.id);

        if (error) throw error;
        toast.success('Profile updated successfully');
      } else {
        const { error } = await supabase
          .from('profile')
          .insert([formData]);

        if (error) throw error;
        toast.success('Profile created successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-2xl font-bold text-foreground">Profile Management</h1>
          </div>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Avatar */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Avatar</h2>
            <div className="flex items-center gap-4">
              {formData.avatar_url && (
                <img src={formData.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
              )}
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold mb-4">Basic Information</h2>
            
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title_en">Title (English)</Label>
                <Input
                  id="title_en"
                  value={formData.title_en}
                  onChange={(e) => handleInputChange('title_en', e.target.value)}
                  placeholder="e.g., General Director Assistant"
                />
              </div>
              <div>
                <Label htmlFor="title_vi">Title (Tiếng Việt)</Label>
                <Input
                  id="title_vi"
                  value={formData.title_vi}
                  onChange={(e) => handleInputChange('title_vi', e.target.value)}
                  placeholder="VD: Trợ lý Tổng Giám đốc"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tagline_en">Tagline (English)</Label>
                <Input
                  id="tagline_en"
                  value={formData.tagline_en}
                  onChange={(e) => handleInputChange('tagline_en', e.target.value)}
                  placeholder="A brief professional tagline"
                />
              </div>
              <div>
                <Label htmlFor="tagline_vi">Tagline (Tiếng Việt)</Label>
                <Input
                  id="tagline_vi"
                  value={formData.tagline_vi}
                  onChange={(e) => handleInputChange('tagline_vi', e.target.value)}
                  placeholder="Câu giới thiệu ngắn gọn"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold mb-4">Summary</h2>
            
            <div>
              <Label htmlFor="summary_en">Summary (English)</Label>
              <Textarea
                id="summary_en"
                value={formData.summary_en}
                onChange={(e) => handleInputChange('summary_en', e.target.value)}
                placeholder="A professional summary highlighting your key strengths"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="summary_vi">Summary (Tiếng Việt)</Label>
              <Textarea
                id="summary_vi"
                value={formData.summary_vi}
                onChange={(e) => handleInputChange('summary_vi', e.target.value)}
                placeholder="Tóm tắt chuyên môn về những điểm mạnh của bạn"
                rows={4}
              />
            </div>
          </div>

          {/* Story */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold mb-4">Your Story</h2>
            
            <div>
              <Label htmlFor="story_en">Story (English)</Label>
              <Textarea
                id="story_en"
                value={formData.story_en}
                onChange={(e) => handleInputChange('story_en', e.target.value)}
                placeholder="Tell your professional story, journey, and what drives you"
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="story_vi">Story (Tiếng Việt)</Label>
              <Textarea
                id="story_vi"
                value={formData.story_vi}
                onChange={(e) => handleInputChange('story_vi', e.target.value)}
                placeholder="Câu chuyện nghề nghiệp, hành trình và động lực của bạn"
                rows={6}
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold mb-4">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+84 XXX XXX XXX"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold mb-4">Social Media</h2>
            
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div>
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                value={formData.github_url}
                onChange={(e) => handleInputChange('github_url', e.target.value)}
                placeholder="https://github.com/yourprofile"
              />
            </div>

            <div>
              <Label htmlFor="twitter_url">Twitter URL</Label>
              <Input
                id="twitter_url"
                value={formData.twitter_url}
                onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                placeholder="https://twitter.com/yourprofile"
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
