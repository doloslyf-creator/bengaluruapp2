
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Play, Edit2, Trash2, Clock, Eye, ArrowLeft, MoveUp, MoveDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface VideoChapter {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  slug: string;
  youtubeUrl: string;
  duration: string;
  thumbnailUrl?: string;
  chapterNumber: number;
  isPreview: boolean;
  learningObjectives: string[];
  keyTakeaways: string[];
  resources: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VideoCourse {
  id: string;
  title: string;
  description: string;
  slug: string;
}

export default function VideoChaptersPage() {
  const [match, params] = useRoute("/admin-panel/video-courses/:courseId/chapters");
  const courseId = params?.courseId;
  const [location, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<VideoChapter | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    youtubeUrl: '',
    duration: '',
    thumbnailUrl: '',
    chapterNumber: 1,
    isPreview: false,
    learningObjectives: '',
    keyTakeaways: '',
    resources: '',
    isPublished: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch course details
  const { data: course } = useQuery<VideoCourse>({
    queryKey: [`/api/video-courses/${courseId}`],
    enabled: !!courseId
  });

  // Fetch chapters for this course
  const { data: chapters = [], isLoading, error } = useQuery<VideoChapter[]>({
    queryKey: [`/api/video-courses/${courseId}/chapters`],
    enabled: !!courseId,
    retry: 3,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<VideoChapter>) => {
      const response = await fetch(`/api/video-courses/${courseId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create chapter");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/video-courses/${courseId}/chapters`] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Chapter created successfully" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<VideoChapter> & { id: string }) => {
      const response = await fetch(`/api/video-chapters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update chapter");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/video-courses/${courseId}/chapters`] });
      setIsDialogOpen(false);
      setEditingChapter(null);
      resetForm();
      toast({ title: "Chapter updated successfully" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/video-chapters/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete chapter");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/video-courses/${courseId}/chapters`] });
      toast({ title: "Chapter deleted successfully" });
    }
  });

  const resetForm = () => {
    const nextChapterNumber = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapterNumber)) + 1 : 1;
    setFormData({
      title: '',
      description: '',
      slug: '',
      youtubeUrl: '',
      duration: '',
      thumbnailUrl: '',
      chapterNumber: nextChapterNumber,
      isPreview: false,
      learningObjectives: '',
      keyTakeaways: '',
      resources: '',
      isPublished: false
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chapterData = {
      ...formData,
      learningObjectives: formData.learningObjectives.split('\n').map(obj => obj.trim()).filter(Boolean),
      keyTakeaways: formData.keyTakeaways.split('\n').map(take => take.trim()).filter(Boolean),
      resources: formData.resources ? JSON.parse(formData.resources) : []
    };

    if (editingChapter) {
      updateMutation.mutate({ id: editingChapter.id, ...chapterData });
    } else {
      createMutation.mutate(chapterData);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !editingChapter) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, editingChapter]);

  if (!courseId) {
    return (
      <AdminLayout title="Chapter Management">
        <div className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Course ID is required to manage chapters.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout title="Chapter Management">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-lg font-semibold">Loading chapters...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Chapter Management">
        <div className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Failed to load chapters. Please check your connection and try again.
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
      </AdminLayout>
    );
  }

  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);

  return (
    <AdminLayout title={`Chapters - ${course?.title || 'Course'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin-panel/video-courses')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course?.title}</h1>
              <p className="text-gray-600">Manage course chapters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Play className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Chapters</p>
                    <p className="text-2xl font-bold text-gray-900">{chapters?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {chapters?.filter(c => c.isPublished).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Play className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Preview Chapters</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {chapters?.filter(c => c.isPreview).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {chapters?.reduce((total, chapter) => total + chapter.viewCount, 0) || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Course Chapters</h2>
              <p className="text-gray-600">Manage individual video chapters</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingChapter(null); resetForm(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Chapter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingChapter ? 'Edit Chapter' : 'Add New Chapter'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Chapter Title</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Chapter Number</label>
                      <Input
                        type="number"
                        value={formData.chapterNumber}
                        onChange={(e) => setFormData({ ...formData, chapterNumber: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Slug (URL-friendly)</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <label className="text-sm font-medium">Thumbnail URL</label>
                    <Input
                      placeholder="https://example.com/thumbnail.jpg"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Learning Objectives (one per line)</label>
                    <Textarea
                      value={formData.learningObjectives}
                      onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                      rows={3}
                      placeholder="Understand property valuation basics&#10;Learn market analysis techniques&#10;Master negotiation strategies"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Key Takeaways (one per line)</label>
                    <Textarea
                      value={formData.keyTakeaways}
                      onChange={(e) => setFormData({ ...formData, keyTakeaways: e.target.value })}
                      rows={3}
                      placeholder="Location determines 70% of appreciation&#10;Always verify legal documents&#10;Factor in hidden costs"
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isPublished}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                      />
                      <label className="text-sm">Published</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isPreview}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPreview: checked })}
                      />
                      <label className="text-sm">Preview Chapter (Free)</label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingChapter ? 'Update' : 'Create'} Chapter
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Chapters List */}
        {sortedChapters.length === 0 ? (
          <div className="text-center py-12">
            <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No chapters yet</h3>
            <p className="text-gray-600 mb-4">Start building your course by adding the first chapter</p>
            <Button onClick={() => { setEditingChapter(null); resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Chapter
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedChapters.map((chapter) => (
              <Card key={chapter.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {chapter.thumbnailUrl ? (
                        <img
                          src={chapter.thumbnailUrl}
                          alt={chapter.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Play className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Chapter {chapter.chapterNumber}
                          </Badge>
                          <h3 className="font-semibold text-lg text-gray-900">{chapter.title}</h3>
                          {!chapter.isPublished && (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                          {chapter.isPreview && (
                            <Badge className="bg-green-100 text-green-800">Free Preview</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingChapter(chapter);
                              setFormData({
                                title: chapter.title,
                                description: chapter.description || '',
                                slug: chapter.slug,
                                youtubeUrl: chapter.youtubeUrl,
                                duration: chapter.duration,
                                thumbnailUrl: chapter.thumbnailUrl || '',
                                chapterNumber: chapter.chapterNumber,
                                isPreview: chapter.isPreview,
                                learningObjectives: chapter.learningObjectives.join('\n'),
                                keyTakeaways: chapter.keyTakeaways.join('\n'),
                                resources: JSON.stringify(chapter.resources, null, 2),
                                isPublished: chapter.isPublished
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(chapter.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {chapter.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {chapter.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {chapter.duration}
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {chapter.viewCount} views
                          </span>
                        </div>
                        
                        {chapter.learningObjectives.length > 0 && (
                          <span>{chapter.learningObjectives.length} learning objectives</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
