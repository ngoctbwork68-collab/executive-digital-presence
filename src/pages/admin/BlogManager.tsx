import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllPosts, useCreatePost, useUpdatePost, useDeletePost, useTogglePostPublished, useAllTags, useCreateTag } from '@/hooks/useBlog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, Tag as TagIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { BlogPost, BlogPostInsert, BlogPostUpdate, BlogTag } from '@/lib/supabase/blog';

export default function BlogManager() {
  const navigate = useNavigate();
  const { data: posts = [], isLoading } = useAllPosts();
  const { data: tags = [] } = useAllTags();
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();
  const togglePublishedMutation = useTogglePostPublished();
  const createTagMutation = useCreateTag();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<BlogPostInsert>>({
    title_en: '',
    title_vi: '',
    slug: '',
    excerpt_en: '',
    excerpt_vi: '',
    content_en: '',
    content_vi: '',
    category_en: '',
    category_vi: '',
    featured_image_url: '',
    author_name: '',
    reading_time: 5,
    published: false,
    featured: false,
  });

  const [newTag, setNewTag] = useState({ name_en: '', name_vi: '', slug: '' });

  useEffect(() => {
    if (editingPost) {
      fetchPostTags(editingPost.id);
    }
  }, [editingPost]);

  const fetchPostTags = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_post_tags')
        .select('tag_id')
        .eq('post_id', postId);
      
      if (error) throw error;
      setSelectedTags(data.map(item => item.tag_id));
    } catch (error) {
      console.error('Error fetching post tags:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleOpenDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title_en: post.title_en,
        title_vi: post.title_vi,
        slug: post.slug,
        excerpt_en: post.excerpt_en || '',
        excerpt_vi: post.excerpt_vi || '',
        content_en: post.content_en,
        content_vi: post.content_vi,
        category_en: post.category_en || '',
        category_vi: post.category_vi || '',
        featured_image_url: post.featured_image_url || '',
        author_name: post.author_name || '',
        reading_time: post.reading_time || 5,
        published: post.published || false,
        featured: post.featured || false,
      });
    } else {
      setEditingPost(null);
      setSelectedTags([]);
      setFormData({
        title_en: '',
        title_vi: '',
        slug: '',
        excerpt_en: '',
        excerpt_vi: '',
        content_en: '',
        content_vi: '',
        category_en: '',
        category_vi: '',
        featured_image_url: '',
        author_name: '',
        reading_time: 5,
        published: false,
        featured: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
    setSelectedTags([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_en || !formData.title_vi || !formData.slug || !formData.content_en || !formData.content_vi) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let postId: string;

      if (editingPost) {
        const result = await updateMutation.mutateAsync({
          id: editingPost.id,
          updates: formData as BlogPostUpdate,
        });
        postId = result.id;
      } else {
        const result = await createMutation.mutateAsync(formData as BlogPostInsert);
        postId = result.id;
      }

      // Update tags
      await updatePostTags(postId);
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const updatePostTags = async (postId: string) => {
    try {
      // Remove all existing tags
      await supabase
        .from('blog_post_tags')
        .delete()
        .eq('post_id', postId);

      // Add selected tags
      if (selectedTags.length > 0) {
        const links = selectedTags.map(tagId => ({ post_id: postId, tag_id: tagId }));
        await supabase
          .from('blog_post_tags')
          .insert(links);
      }
    } catch (error) {
      console.error('Error updating post tags:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting post:', error);
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

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCreateTag = async () => {
    if (!newTag.name_en || !newTag.name_vi || !newTag.slug) {
      toast.error('Please fill in all tag fields');
      return;
    }

    try {
      await createTagMutation.mutateAsync(newTag);
      setNewTag({ name_en: '', name_vi: '', slug: '' });
      setIsTagDialogOpen(false);
    } catch (error) {
      console.error('Error creating tag:', error);
    }
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
            <h1 className="text-3xl font-bold text-foreground">Blog Manager</h1>
          </div>
          <div className="flex gap-2">
            <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <TagIcon className="h-4 w-4 mr-2" />
                  Manage Tags
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tag_name_en">Tag Name (EN)</Label>
                    <Input
                      id="tag_name_en"
                      value={newTag.name_en}
                      onChange={(e) => setNewTag({ ...newTag, name_en: e.target.value })}
                      placeholder="Technology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tag_name_vi">Tag Name (VI)</Label>
                    <Input
                      id="tag_name_vi"
                      value={newTag.name_vi}
                      onChange={(e) => setNewTag({ ...newTag, name_vi: e.target.value })}
                      placeholder="Công nghệ"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tag_slug">Tag Slug</Label>
                    <Input
                      id="tag_slug"
                      value={newTag.slug}
                      onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
                      placeholder="technology"
                    />
                  </div>
                  <Button onClick={handleCreateTag} className="w-full">Create Tag</Button>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Existing Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name_en} / {tag.name_vi}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPost ? 'Edit Post' : 'Create Post'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title_en">Title (EN) *</Label>
                      <Input
                        id="title_en"
                        value={formData.title_en}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ 
                            ...formData, 
                            title_en: value,
                            slug: !editingPost ? generateSlug(value) : formData.slug
                          });
                        }}
                        placeholder="The Future of Technology"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title_vi">Title (VI) *</Label>
                      <Input
                        id="title_vi"
                        value={formData.title_vi}
                        onChange={(e) => setFormData({ ...formData, title_vi: e.target.value })}
                        placeholder="Tương lai của Công nghệ"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="the-future-of-technology"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="excerpt_en">Excerpt (EN)</Label>
                      <Textarea
                        id="excerpt_en"
                        value={formData.excerpt_en}
                        onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                        placeholder="Brief summary of the post"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="excerpt_vi">Excerpt (VI)</Label>
                      <Textarea
                        id="excerpt_vi"
                        value={formData.excerpt_vi}
                        onChange={(e) => setFormData({ ...formData, excerpt_vi: e.target.value })}
                        placeholder="Tóm tắt ngắn gọn về bài viết"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="content_en">Content (EN) *</Label>
                      <Textarea
                        id="content_en"
                        value={formData.content_en}
                        onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                        placeholder="Full post content in English (supports Markdown)"
                        rows={10}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content_vi">Content (VI) *</Label>
                      <Textarea
                        id="content_vi"
                        value={formData.content_vi}
                        onChange={(e) => setFormData({ ...formData, content_vi: e.target.value })}
                        placeholder="Nội dung đầy đủ bằng tiếng Việt (hỗ trợ Markdown)"
                        rows={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category_en">Category (EN)</Label>
                      <Input
                        id="category_en"
                        value={formData.category_en}
                        onChange={(e) => setFormData({ ...formData, category_en: e.target.value })}
                        placeholder="Technology"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category_vi">Category (VI)</Label>
                      <Input
                        id="category_vi"
                        value={formData.category_vi}
                        onChange={(e) => setFormData({ ...formData, category_vi: e.target.value })}
                        placeholder="Công nghệ"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 p-4 border rounded-md">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.name_en}
                        </Badge>
                      ))}
                      {tags.length === 0 && (
                        <p className="text-sm text-muted-foreground">No tags available. Create tags first.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featured_image_url">Featured Image URL</Label>
                    <Input
                      id="featured_image_url"
                      value={formData.featured_image_url}
                      onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author_name">Author Name</Label>
                      <Input
                        id="author_name"
                        value={formData.author_name}
                        onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                        placeholder="Trần Bảo Ngọc"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reading_time">Reading Time (minutes)</Label>
                      <Input
                        id="reading_time"
                        type="number"
                        value={formData.reading_time}
                        onChange={(e) => setFormData({ ...formData, reading_time: parseInt(e.target.value) || 5 })}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
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
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingPost ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{post.title_en}</div>
                      <div className="text-sm text-muted-foreground">{post.title_vi}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {post.category_en && <div>{post.category_en}</div>}
                      {post.category_vi && <div className="text-muted-foreground">{post.category_vi}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{post.author_name || '-'}</TableCell>
                  <TableCell>{post.views || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {post.featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublished(post.id, post.published || false)}
                    >
                      {post.published ? (
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
                        onClick={() => handleOpenDialog(post)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
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
