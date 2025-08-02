import { Request, Response } from "express";
import { db } from "./db";
import { blogPosts, insertBlogPostSchema } from "@shared/schema";
import { eq, desc, and, ilike, sql } from "drizzle-orm";

// Get all blog posts with filtering and pagination
export async function getBlogPosts(req: Request, res: Response) {
  try {
    const { 
      status = "published", 
      category, 
      search, 
      page = "1", 
      limit = "10",
      includeStats = "false"
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let whereConditions = [];
    
    // Filter by status
    if (status && status !== "all") {
      whereConditions.push(eq(blogPosts.status, status as string));
    }
    
    // Filter by category
    if (category && category !== "all") {
      whereConditions.push(eq(blogPosts.category, category as string));
    }
    
    // Search in title and content
    if (search) {
      whereConditions.push(
        sql`(${blogPosts.title} ILIKE ${`%${search}%`} OR ${blogPosts.content} ILIKE ${`%${search}%`})`
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get posts with pagination
    const posts = await db
      .select()
      .from(blogPosts)
      .where(whereClause)
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(whereClause);

    let responseData: any = {
      posts,
      pagination: {
        total: count,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(count / parseInt(limit as string))
      }
    };

    // Include statistics if requested
    if (includeStats === "true") {
      const stats = await getBlogStats();
      responseData.stats = stats;
    }

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
}

// Get single blog post by ID or slug
export async function getBlogPost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Try to find by ID first, then by slug
    let post = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    if (post.length === 0) {
      post = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, id))
        .limit(1);
    }

    if (post.length === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Increment view count
    await db
      .update(blogPosts)
      .set({ views: sql`${blogPosts.views} + 1` })
      .where(eq(blogPosts.id, post[0].id));

    res.json(post[0]);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
}

// Create new blog post
export async function createBlogPost(req: Request, res: Response) {
  try {
    const validatedData = insertBlogPostSchema.parse(req.body);
    
    // Generate slug from title if not provided
    if (!validatedData.slug) {
      validatedData.slug = generateSlug(validatedData.title);
    }

    // Set publishedAt if status is published
    if (validatedData.status === "published" && !validatedData.publishedAt) {
      validatedData.publishedAt = new Date();
    }

    // Calculate reading time based on content length
    if (!validatedData.readingTime) {
      validatedData.readingTime = calculateReadingTime(validatedData.content);
    }

    const [newPost] = await db
      .insert(blogPosts)
      .values(validatedData)
      .returning();

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Failed to create blog post" });
  }
}

// Update blog post
export async function updateBlogPost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = insertBlogPostSchema.parse(req.body);
    
    // Update publishedAt if changing to published status
    if (validatedData.status === "published") {
      const existingPost = await db
        .select({ status: blogPosts.status, publishedAt: blogPosts.publishedAt })
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);

      if (existingPost.length > 0 && existingPost[0].status !== "published" && !existingPost[0].publishedAt) {
        validatedData.publishedAt = new Date();
      }
    }

    // Recalculate reading time if content changed
    if (validatedData.content) {
      validatedData.readingTime = calculateReadingTime(validatedData.content);
    }

    const [updatedPost] = await db
      .update(blogPosts)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();

    if (!updatedPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ error: "Failed to update blog post" });
  }
}

// Delete blog post
export async function deleteBlogPost(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const [deletedPost] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();

    if (!deletedPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Failed to delete blog post" });
  }
}

// Get blog statistics
export async function getBlogStats() {
  try {
    const [stats] = await db
      .select({
        totalPosts: sql<number>`count(*)`,
        publishedPosts: sql<number>`count(*) filter (where status = 'published')`,
        draftPosts: sql<number>`count(*) filter (where status = 'draft')`,
        totalViews: sql<number>`sum(${blogPosts.views})`,
        avgReadingTime: sql<number>`avg(${blogPosts.readingTime})`,
      })
      .from(blogPosts);

    // Get posts by category
    const categoryStats = await db
      .select({
        category: blogPosts.category,
        count: sql<number>`count(*)`
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .groupBy(blogPosts.category);

    return {
      ...stats,
      postsByCategory: categoryStats.reduce((acc, item) => {
        acc[item.category] = item.count;
        return acc;
      }, {} as Record<string, number>)
    };
  } catch (error) {
    console.error("Error fetching blog stats:", error);
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      totalViews: 0,
      avgReadingTime: 0,
      postsByCategory: {}
    };
  }
}

// Helper functions
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}