import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Eye, Edit, Trash2, FileText, Users, TrendingUp, Clock } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import type { BlogPost } from "@shared/schema";
import BlogEditor from "@/components/blog/blog-editor";

export default function BlogManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch blog posts with filters
  const { data: blogData, isLoading } = useQuery({
    queryKey: ["/api/blog", statusFilter, categoryFilter, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams({
        status: statusFilter,
        category: categoryFilter,
        search: searchTerm,
        includeStats: "true"
      });
      return apiRequest(`/api/blog?${params}`);
    }
  });

  const posts = blogData?.posts || [];
  const stats = blogData?.stats || {};

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return apiRequest(`/api/blog/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    }
  });

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsEditorOpen(true);
  };

  const handleNewPost = () => {
    setSelectedPost(null);
    setIsEditorOpen(true);
  };

  const handleDeletePost = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      published: "default",
      draft: "secondary",
      archived: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const categories = [
    { value: "market-insights", label: "Market Insights" },
    { value: "property-guide", label: "Property Guide" },
    { value: "investment-tips", label: "Investment Tips" },
    { value: "legal-updates", label: "Legal Updates" },
    { value: "company-news", label: "Company News" },
  ];

  return (
    <AdminLayout title="Blog Management">
      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.publishedPosts || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Reading Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.avgReadingTime || 0)} min</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleNewPost}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Posts Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading blog posts...
                    </TableCell>
                  </TableRow>
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No blog posts found. Create your first post!
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post: BlogPost) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{post.title}</div>
                          {post.excerpt && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {post.excerpt}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(post.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categories.find(c => c.value === post.category)?.label || post.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>{post.views}</TableCell>
                      <TableCell>{formatDate(post.publishedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditPost(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Blog Editor Dialog */}
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {selectedPost ? "Edit Blog Post" : "Create New Blog Post"}
              </DialogTitle>
            </DialogHeader>
            <BlogEditor 
              post={selectedPost}
              onSave={() => {
                setIsEditorOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
              }}
              onCancel={() => setIsEditorOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}