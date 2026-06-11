import { useState } from 'react';
import { useAllMedia, useDeleteMediaItem, useUpdateMediaItem, useCreateMediaItem } from '@/hooks/useMedia';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Copy, Check, Image as ImageIcon, Video, FileText, Upload, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { MediaItem } from '@/lib/supabase/media';
import { optimizeImage, formatBytes, type OptimizeReport } from '@/lib/imageOptimizer';

export default function MediaLibrary() {
  const { data: media = [], isLoading } = useAllMedia();
  const deleteMedia = useDeleteMediaItem();
  const updateMedia = useUpdateMediaItem();
  const createMediaItem = useCreateMediaItem();

  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastReport, setLastReport] = useState<OptimizeReport | null>(null);
  const [editFormData, setEditFormData] = useState({ alt_text_en: '', alt_text_vi: '' });

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
      const original = event.target.files?.[0];
      if (!original) return;
      if (original.size > 10 * 1024 * 1024) { toast.error('File size must be less than 10MB'); return; }
      setUploading(true);

      let file = original;
      let report: OptimizeReport | null = null;
      if (original.type.startsWith('image/')) {
        try {
          report = await optimizeImage(original, { maxDimension: 1920, quality: 0.82, preferAvif: true });
          if (report.optimized) {
            file = report.file;
            toast.success(`Đã tối ưu ảnh: ${formatBytes(report.originalSize)} → ${formatBytes(report.newSize)} (-${report.savedPct}%)`);
          }
        } catch (err) {
          console.warn('Optimization skipped:', err);
        }
      }
      setLastReport(report);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio-media').upload(fileName, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('portfolio-media').getPublicUrl(fileName);
      await createMediaItem.mutateAsync({ filename: file.name, url: publicUrl, file_type: file.type, file_size: file.size });
      toast.success('File uploaded successfully');
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this media item?')) {
      await deleteMedia.mutateAsync(id);
      toast.success('Media deleted');
    }
  };

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL copied');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleEdit = (item: MediaItem) => {
    setEditingMedia(item);
    setEditFormData({ alt_text_en: item.alt_text_en || '', alt_text_vi: item.alt_text_vi || '' });
  };

  const handleUpdateAltText = async () => {
    if (!editingMedia) return;
    await updateMedia.mutateAsync({ id: editingMedia.id, updates: editFormData });
    setEditingMedia(null);
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
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
        <p className="text-sm text-muted-foreground">{filteredMedia.length} items</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input placeholder="Search by filename or alt text..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-md" />
        </div>
        <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Upload */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <Label htmlFor="file-upload" className="block mb-2">Upload New Media</Label>
          <div className="flex items-center gap-4">
            <Input id="file-upload" type="file" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} className="max-w-md" />
            {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Accepted: Images & Videos (max 10MB). Ảnh tự động resize ≤1920px và chuyển sang WebP/AVIF để đồng đều, nhẹ tải.</p>
          {lastReport && lastReport.optimized && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>
                Đã tối ưu ảnh gần nhất: {formatBytes(lastReport.originalSize)} → {formatBytes(lastReport.newSize)} (-{lastReport.savedPct}%)
                {lastReport.newDimensions && `, ${lastReport.newDimensions.w}×${lastReport.newDimensions.h}`}
                , định dạng {lastReport.newType.replace('image/', '').toUpperCase()}.
              </span>
            </div>
          )}
          {lastReport && !lastReport.optimized && lastReport.skipped === 'no-gain' && (
            <p className="mt-2 text-xs text-muted-foreground">Ảnh đã đủ nhẹ — giữ nguyên bản gốc.</p>
          )}
        </CardContent>
      </Card>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No media found</h3>
          <p className="text-muted-foreground">{searchQuery ? 'Try a different search term' : 'Upload your first media file'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow rounded-2xl">
              <div className="aspect-video bg-muted relative overflow-hidden">
                {item.file_type?.startsWith('image') ? (
                  <img src={item.url} alt={item.alt_text_en || item.filename} className="w-full h-full object-cover" />
                ) : item.file_type?.startsWith('video') ? (
                  <video src={item.url} className="w-full h-full object-cover" muted />
                ) : (
                  <div className="flex items-center justify-center h-full"><FileText className="h-12 w-12 text-muted-foreground" /></div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => copyToClipboard(item.url)}>
                    {copiedUrl === item.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm truncate flex-1" title={item.filename}>{item.filename}</h3>
                  <Badge variant="outline" className="shrink-0">{getFileTypeIcon(item.file_type)}</Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>{formatFileSize(item.file_size)}</p>
                  <p>{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingMedia} onOpenChange={() => setEditingMedia(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Media Details</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {editingMedia && (
              <>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {editingMedia.file_type?.startsWith('image') ? (
                    <img src={editingMedia.url} alt={editingMedia.filename} className="w-full h-full object-cover" />
                  ) : (
                    <video src={editingMedia.url} className="w-full h-full object-cover" controls />
                  )}
                </div>
                <div>
                  <Label>Filename</Label>
                  <Input value={editingMedia.filename} disabled className="bg-muted" />
                </div>
                <div>
                  <Label>Alt Text (English)</Label>
                  <Input value={editFormData.alt_text_en} onChange={(e) => setEditFormData({ ...editFormData, alt_text_en: e.target.value })} placeholder="Describe the image in English" />
                </div>
                <div>
                  <Label>Alt Text (Vietnamese)</Label>
                  <Input value={editFormData.alt_text_vi} onChange={(e) => setEditFormData({ ...editFormData, alt_text_vi: e.target.value })} placeholder="Mô tả hình ảnh bằng tiếng Việt" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingMedia(null)}>Cancel</Button>
                  <Button onClick={handleUpdateAltText}>Save Changes</Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
