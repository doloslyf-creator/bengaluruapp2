import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Eye, Clock, Tag, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertBlogPostSchema, type BlogPost, type InsertBlogPost } from "@shared/schema";

interface BlogEditorProps {
  post?: BlogPost | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
  const [newTag, setNewTag] = useState("");
  const [currentTags, setCurrentTags] = useState<string[]>(post?.tags || []);
  
  const form = useForm<InsertBlogPost>({
    resolver: zodResolver(insertBlogPostSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      metaTitle: post?.metaTitle || "",
      metaDescription: post?.metaDescription || "",
      category: post?.category || "market-insights",
      status: post?.status || "draft",
      author: post?.author || "PropertyHub Team",
      featuredImage: post?.featuredImage || "",
      tags: post?.tags || [],
      readingTime: post?.readingTime || 5,
    }
  });

  // Auto-generate slug from title
  useEffect(() => {
    const title = form.watch("title");
    if (title && !post) { // Only auto-generate for new posts
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue("slug", slug);
    }
  }, [form.watch("title")]);

  // Calculate reading time from content
  useEffect(() => {
    const content = form.watch("content");
    if (content) {
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      form.setValue("readingTime", readingTime);
    }
  }, [form.watch("content")]);

  // Update tags in form when currentTags changes
  useEffect(() => {
    form.setValue("tags", currentTags);
  }, [currentTags, form]);

  const createMutation = useMutation({
    mutationFn: (data: InsertBlogPost) => {
      return apiRequest("POST", "/api/blog", data);
    },
    onSuccess: onSave,
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertBlogPost) => {
      return apiRequest("PATCH", `/api/blog/${post?.id}`, data);
    },
    onSuccess: onSave,
  });

  const handleSubmit = (data: InsertBlogPost) => {
    const formData = { ...data, tags: currentTags };
    
    if (post) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setCurrentTags([...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
  };

  const categories = [
    { value: "market-insights", label: "Market Insights" },
    { value: "property-guide", label: "Property Guide" },
    { value: "investment-tips", label: "Investment Tips" },
    { value: "legal-updates", label: "Legal Updates" },
    { value: "company-news", label: "Company News" },
  ];

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-h-[80vh] overflow-y-auto space-y-6 p-2">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter post title..."
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                {...form.register("slug")}
                placeholder="url-friendly-slug"
              />
              {form.formState.errors.slug && (
                <p className="text-sm text-red-600">{form.formState.errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              {...form.register("excerpt")}
              placeholder="Brief summary of the post..."
              rows={2}
            />
          </div>
        </div>

        <Separator />

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            {...form.register("content")}
            placeholder="Write your blog post content here..."
            rows={12}
            className="min-h-[200px]"
          />
          {form.formState.errors.content && (
            <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            Estimated reading time: {form.watch("readingTime")} minutes
          </div>
        </div>

        <Separator />

        {/* Metadata and Settings */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Publishing Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={form.watch("category")} 
                onValueChange={(value) => form.setValue("category", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={form.watch("status")} 
                onValueChange={(value) => form.setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                {...form.register("author")}
                placeholder="Author name"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">SEO & Media</h3>
            
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                {...form.register("metaTitle")}
                placeholder="SEO title (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                {...form.register("metaDescription")}
                placeholder="SEO description (optional)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImage">Featured Image URL</Label>
              <Input
                id="featuredImage"
                {...form.register("featuredImage")}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Tags */}
        <div className="space-y-4">
          <h3 className="font-medium">Tags</h3>
          
          <div className="flex items-center space-x-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" onClick={addTag} variant="outline">
              <Tag className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {currentTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentTags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)} 
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button 
              type="button" 
              disabled={isPending}
              variant="outline"
              onClick={(e) => {
                form.setValue("status", "draft");
                form.handleSubmit(handleSubmit)();
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              type="button" 
              disabled={isPending}
              onClick={(e) => {
                form.setValue("status", "published");
                form.handleSubmit(handleSubmit)();
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              {post?.status === "published" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}