import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';

interface MediaUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

export const MediaUpload = ({
  value,
  onChange,
  label = 'Upload File',
  accept = 'image/*,video/*',
  maxSizeMB = 10
}: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      setUploading(true);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onChange(publicUrl);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
  };

  const isVideo = preview && (preview.includes('.mp4') || preview.includes('.webm') || preview.includes('.mov'));

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative inline-block">
          {isVideo ? (
            <video
              src={preview}
              className="max-w-xs rounded-lg border"
              controls
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="max-w-xs rounded-lg border"
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept={accept}
            onChange={handleUpload}
            disabled={uploading}
            className="max-w-xs"
          />
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      )}
      
      {!preview && !uploading && (
        <p className="text-sm text-muted-foreground">
          Accepted: Images & Videos (max {maxSizeMB}MB)
        </p>
      )}
    </div>
  );
};
