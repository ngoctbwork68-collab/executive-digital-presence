import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllMedia, useDeleteMediaItem, useUpdateMediaItem, useCreateMediaItem } from '@/hooks/useMedia';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, Edit, Copy, Check, Image as ImageIcon, Video, FileText, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MediaItem } from '@/lib/supabase/media';

export default function MediaLibrary() {
  const navigate = useNavigate();
  const { data: media = [], isLoading } = useAllMedia();
  const deleteMedia = useDeleteMediaItem();
  const updateMedia = useUpdateMediaItem();
  const createMediaItem = useCreateMediaItem();

  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [editFormData, setEditFormData] = useState({
    alt_text_en: '',
    alt_text_vi: '',
  });

  const filteredMedia = media.filter((item) => {
    const matchesFilter = filter === 'all' || item.file_type?.startsWith(filter);
    const matchesSearch = searchQuery === '' || 
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alt_text_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alt_text_vi?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
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

      // Create media library record
      await createMediaItem.mutateAsync({
        filename: file.name,
        url: publicUrl,
        file_type: file.type,
        file_size: file.size,
      });

      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      // Reset input
      if (event.target) event.target.value = '';
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (window.confirm('Are you sure you want to delete this media item?')) {
      try {
        // Delete from database
        await deleteMedia.mutateAsync(id);
        
        // Optionally delete from storage (requires importing supabase client)
        // For now, just delete the database record
        toast.success('Media deleted. Storage file may need manual cleanup.');
      } catch (error) {
        console.error('Error deleting media:', error);
      }
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleEdit = (item: MediaItem) => {
    setEditingMedia(item);
    setEditFormData({
      alt_text_en: item.alt_text_en || '',
      alt_text_vi: item.alt_text_vi || '',
    });
  };

  const handleUpdateAltText = async () => {
    if (!editingMedia) return;

    try {
      await updateMedia.mutateAsync({
        id: editingMedia.id,
        updates: editFormData,
      });
      setEditingMedia(null);
    } catch (error) {
      console.error('Error updating media:', error);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
  };

  const getFileTypeIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-4 w-4" />;
    if (fileType.startsWith('image')) return <ImageIcon className="h-4 w-4" />;
    if (fileType.startsWith('video')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading media library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Media Library</h1>
                <p className="text-sm text-muted-foreground">{filteredMedia.length} items</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by filename or alt text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Label htmlFor="file-upload" className="block mb-2">Upload New Media</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file-upload"
                type="file"
                accept="image/*,video/*"
                onChange={handleUpload}
                disabled={uploading}
                className="max-w-md"
              />
              {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Accepted: Images & Videos (max 10MB)
            </p>
          </CardContent>
        </Card>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No media found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Upload your first media file to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {item.file_type?.startsWith('image') ? (
                    <img
                      src={item.url}
                      alt={item.alt_text_en || item.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : item.file_type?.startsWith('video') ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyToClipboard(item.url)}
                    >
                      {copiedUrl === item.url ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id, item.url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm truncate flex-1" title={item.filename}>
                      {item.filename}
                    </h3>
                    <Badge variant="outline" className="shrink-0">
                      {getFileTypeIcon(item.file_type)}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>{formatFileSize(item.file_size)}</p>
                    <p>{new Date(item.created_at).toLocaleDateString()}</p>
                    {item.alt_text_en && (
                      <p className="truncate" title={item.alt_text_en}>
                        Alt: {item.alt_text_en}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingMedia} onOpenChange={() => setEditingMedia(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Media Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editingMedia && (
                <>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    {editingMedia.file_type?.startsWith('image') ? (
                      <img
                        src={editingMedia.url}
                        alt={editingMedia.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={editingMedia.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="filename">Filename</Label>
                    <Input
                      id="filename"
                      value={editingMedia.filename}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alt_text_en">Alt Text (English)</Label>
                    <Input
                      id="alt_text_en"
                      value={editFormData.alt_text_en}
                      onChange={(e) => setEditFormData({ ...editFormData, alt_text_en: e.target.value })}
                      placeholder="Describe the image in English"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alt_text_vi">Alt Text (Vietnamese)</Label>
                    <Input
                      id="alt_text_vi"
                      value={editFormData.alt_text_vi}
                      onChange={(e) => setEditFormData({ ...editFormData, alt_text_vi: e.target.value })}
                      placeholder="Mô tả hình ảnh bằng tiếng Việt"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingMedia(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateAltText}>
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
