
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Play, Edit, Trash2, Eye, Clock, Users, BarChart3, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoContent {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  tags: string[];
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function VideoEducation() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoContent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    category: '',
    difficulty: 'beginner' as const,
    duration: '',
    tags: '',
    isPublished: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading, error } = useQuery<VideoContent[]>({
    queryKey: ["/api/video-education"],
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<VideoContent>) => {
      const response = await fetch("/api/video-education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-education"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Video content created successfully" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<VideoContent> & { id: string }) => {
      const response = await fetch(`/api/video-education/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-education"] });
      setIsDialogOpen(false);
      setEditingVideo(null);
      resetForm();
      toast({ title: "Video content updated successfully" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/video-education/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete video");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-education"] });
      toast({ title: "Video content deleted successfully" });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      category: '',
      difficulty: 'beginner',
      duration: '',
      tags: '',
      isPublished: false
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, ...videoData });
    } else {
      createMutation.mutate(videoData);
    }
  };

  const categories = [
    'Property Basics',
    'Legal Documentation',
    'Investment Strategy',
    'Market Analysis',
    'Home Loans',
    'RERA Compliance',
    'Property Inspection',
    'Negotiation Tips'
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Video Education Center</h1>
            <p className="text-muted-foreground">Manage educational video content for property buyers</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-semibold">Loading video education content...</p>
            <p className="text-muted-foreground">Please wait while we fetch your videos</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Video Education Center</h1>
            <p className="text-muted-foreground">Manage educational video content for property buyers</p>
          </div>
        </div>
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to load video education content. Please check your connection and try again.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Video Education Center</h1>
          <p className="text-muted-foreground">Manage educational video content for property buyers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingVideo(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <Input
                    placeholder="e.g., 5:30"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">YouTube URL</label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  placeholder="property, investment, legal"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <label className="text-sm">Publish immediately</label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingVideo ? 'Update' : 'Create'} Video
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Play className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold">{videos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{videos.reduce((sum, v) => sum + v.viewCount, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{videos.filter(v => v.isPublished).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-orange-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{new Set(videos.map(v => v.category)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first educational video</p>
          <Button onClick={() => { setEditingVideo(null); resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeUrl.split('v=')[1]?.split('&')[0]}`}
                className="w-full h-full"
                allowFullScreen
                title={video.title}
              />
              {!video.isPublished && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">Draft</Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
                <div className="flex space-x-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingVideo(video);
                      setFormData({
                        title: video.title,
                        description: video.description,
                        youtubeUrl: video.youtubeUrl,
                        category: video.category,
                        difficulty: video.difficulty,
                        duration: video.duration,
                        tags: video.tags.join(', '),
                        isPublished: video.isPublished
                      });
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(video.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
              
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {video.duration}
                </span>
                <span className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {video.viewCount}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge variant="outline" className="text-xs">{video.category}</Badge>
                <Badge variant={video.difficulty === 'beginner' ? 'default' : video.difficulty === 'intermediate' ? 'secondary' : 'destructive'} className="text-xs">
                  {video.difficulty}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {video.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
                {video.tags.length > 3 && <span className="text-xs text-muted-foreground">+{video.tags.length - 3}</span>}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}
