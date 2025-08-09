
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Play, Edit2, Trash2, Users, Clock, Eye, BookOpen, Video, GraduationCap, List } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

interface VideoCourse {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnailUrl?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
  enrollmentCount: number;
  completionCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export default function VideoCoursesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<VideoCourse | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    thumbnailUrl: '',
    level: 'beginner' as const,
    estimatedDuration: '',
    category: '',
    tags: '',
    isPublished: false,
    isFeatured: false,
    displayOrder: 0,
    metaTitle: '',
    metaDescription: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: courses = [], isLoading, error } = useQuery<VideoCourse[]>({
    queryKey: ["/api/video-courses"],
    retry: 3,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<VideoCourse>) => {
      const response = await fetch("/api/video-courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create course");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-courses"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Video course created successfully" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<VideoCourse> & { id: string }) => {
      const response = await fetch(`/api/video-courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update course");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-courses"] });
      setIsDialogOpen(false);
      setEditingCourse(null);
      resetForm();
      toast({ title: "Video course updated successfully" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/video-courses/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete course");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-courses"] });
      toast({ title: "Video course deleted successfully" });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      slug: '',
      thumbnailUrl: '',
      level: 'beginner',
      estimatedDuration: '',
      category: '',
      tags: '',
      isPublished: false,
      isFeatured: false,
      displayOrder: 0,
      metaTitle: '',
      metaDescription: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const courseData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, ...courseData });
    } else {
      createMutation.mutate(courseData);
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

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !editingCourse) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, editingCourse]);

  if (isLoading) {
    return (
      <AdminLayout title="Video Courses Management">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-lg font-semibold">Loading video courses...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Video Courses Management">
        <div className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Failed to load video courses. Please check your connection and try again.
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

  return (
    <AdminLayout title="Video Courses Management">
      <div className="p-6">
        {/* Header Stats */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{courses?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Play className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {courses?.filter(c => c.isPublished).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Enrollments</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {courses?.reduce((total, course) => total + course.enrollmentCount, 0) || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(courses?.map(c => c.category)).size || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Video Courses</h2>
              <p className="text-gray-600">Manage your structured learning courses</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingCourse(null); resetForm(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
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
                      <label className="text-sm font-medium">Slug (URL-friendly)</label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                      />
                    </div>
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
                      <label className="text-sm font-medium">Level</label>
                      <Select value={formData.level} onValueChange={(value: any) => setFormData({ ...formData, level: value })}>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Estimated Duration</label>
                      <Input
                        placeholder="e.g., 1 hour 30 minutes"
                        value={formData.estimatedDuration}
                        onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Display Order</label>
                      <Input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
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
                    <label className="text-sm font-medium">Tags (comma-separated)</label>
                    <Input
                      placeholder="property, investment, legal"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Meta Title (SEO)</label>
                      <Input
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder="SEO-optimized title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Meta Description (SEO)</label>
                      <Textarea
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        placeholder="SEO-optimized description (150-160 characters)"
                        rows={2}
                      />
                    </div>
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
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                      />
                      <label className="text-sm">Featured</label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCourse ? 'Update' : 'Create'} Course
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first video course</p>
            <Button onClick={() => { setEditingCourse(null); resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Course
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <GraduationCap className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                  {!course.isPublished && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary">Draft</Badge>
                    </div>
                  )}
                  {course.isFeatured && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500">Featured</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{course.title}</h3>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/admin-panel/video-courses/${course.id}/chapters`)}
                        title="Manage Chapters"
                      >
                        <List className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingCourse(course);
                          setFormData({
                            title: course.title,
                            description: course.description,
                            slug: course.slug,
                            thumbnailUrl: course.thumbnailUrl || '',
                            level: course.level,
                            estimatedDuration: course.estimatedDuration || '',
                            category: course.category,
                            tags: course.tags.join(', '),
                            isPublished: course.isPublished,
                            isFeatured: course.isFeatured,
                            displayOrder: course.displayOrder,
                            metaTitle: course.metaTitle || '',
                            metaDescription: course.metaDescription || ''
                          });
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(course.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{course.description}</p>

                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {course.estimatedDuration || 'Not set'}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {course.enrollmentCount}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="outline" className="text-xs">{course.category}</Badge>
                    <Badge variant={course.level === 'beginner' ? 'default' : course.level === 'intermediate' ? 'secondary' : 'destructive'} className="text-xs">
                      {course.level}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {course.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                    {course.tags.length > 3 && <span className="text-xs text-muted-foreground">+{course.tags.length - 3}</span>}
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
