import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elegant transition-all">
            <h2 className="font-display text-xl font-semibold mb-2">Profile</h2>
            <p className="text-muted-foreground mb-4">Manage your profile information</p>
            <Button className="w-full">Manage</Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elegant transition-all">
            <h2 className="font-display text-xl font-semibold mb-2">Experiences</h2>
            <p className="text-muted-foreground mb-4">Add and edit work experiences</p>
            <Button className="w-full">Manage</Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elegant transition-all">
            <h2 className="font-display text-xl font-semibold mb-2">Projects</h2>
            <p className="text-muted-foreground mb-4">Showcase your projects</p>
            <Button className="w-full">Manage</Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elegant transition-all">
            <h2 className="font-display text-xl font-semibold mb-2">Activities</h2>
            <p className="text-muted-foreground mb-4">Manage your activities</p>
            <Button className="w-full">Manage</Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elegant transition-all">
            <h2 className="font-display text-xl font-semibold mb-2">Blog</h2>
            <p className="text-muted-foreground mb-4">Write and publish blog posts</p>
            <Button className="w-full">Manage</Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elegant transition-all">
            <h2 className="font-display text-xl font-semibold mb-2">Media</h2>
            <p className="text-muted-foreground mb-4">Upload and manage media files</p>
            <Button className="w-full">Manage</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
