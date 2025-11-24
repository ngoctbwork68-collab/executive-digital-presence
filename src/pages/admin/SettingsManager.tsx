import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function SettingsManager() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    footer_text_en: '',
    footer_text_vi: '',
    footer_tagline_en: '',
    footer_tagline_vi: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .in('key', ['footer_text_en', 'footer_text_vi', 'footer_tagline_en', 'footer_tagline_vi']);

      if (error) throw error;

      const settingsMap: any = {};
      data?.forEach(item => {
        settingsMap[item.key] = item.value_en || '';
      });

      setSettings(settingsMap);
    } catch (error: any) {
      toast.error('Failed to load settings');
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value_en: value,
        description: `Footer setting: ${key}`,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-2xl font-bold text-foreground">Footer Settings</h1>
          </div>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold mb-4">Footer Content</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="footer_tagline_en">Footer Tagline (English)</Label>
                <Input
                  id="footer_tagline_en"
                  value={settings.footer_tagline_en}
                  onChange={(e) => handleInputChange('footer_tagline_en', e.target.value)}
                  placeholder="e.g., Executive Assistant & International Relations Manager"
                />
              </div>
              <div>
                <Label htmlFor="footer_tagline_vi">Footer Tagline (Tiếng Việt)</Label>
                <Input
                  id="footer_tagline_vi"
                  value={settings.footer_tagline_vi}
                  onChange={(e) => handleInputChange('footer_tagline_vi', e.target.value)}
                  placeholder="VD: Trợ lý Giám đốc & Quản lý Quan hệ Quốc tế"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="footer_text_en">Footer Description (English)</Label>
              <Textarea
                id="footer_text_en"
                value={settings.footer_text_en}
                onChange={(e) => handleInputChange('footer_text_en', e.target.value)}
                placeholder="Brief description or mission statement for footer"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="footer_text_vi">Footer Description (Tiếng Việt)</Label>
              <Textarea
                id="footer_text_vi"
                value={settings.footer_text_vi}
                onChange={(e) => handleInputChange('footer_text_vi', e.target.value)}
                placeholder="Mô tả ngắn gọn hoặc tuyên bố sứ mệnh cho footer"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> These settings control the footer content displayed across all public pages. 
              Changes will be reflected immediately after saving.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
