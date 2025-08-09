import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Clock, Eye, Search, Filter, BookOpen, GraduationCap, Award, CheckCircle, ArrowRight, Users } from "lucide-react";
import { updateMetaTags } from "@/utils/seo";
import { useNavigate } from "react-router-dom";

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
}

interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  thumbnailUrl?: string;
  estimatedDuration?: string;
  enrollmentCount: number;
  isFeatured: boolean;
}

export default function PropertyEducation() {
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    updateMetaTags(
      'Property Education Center - Learn Real Estate Investment | OwnitWise',
      'Master property investment with our comprehensive video education center. Learn about legal documentation, market analysis, RERA compliance, and smart investment strategies.',
      'property education, real estate learning, investment education, property videos, RERA compliance, legal documentation',
      undefined,
      window.location.origin + '/property-education'
    );
  }, []);

  const { data: videos = [], isLoading: isLoadingVideos } = useQuery<VideoContent[]>({
    queryKey: ["/api/video-education/public"]
  });

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses/public"]
  });

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || video.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty && video.isPublished;
  });

  const categories = Array.from(new Set(videos.map(v => v.category)));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const learningPaths = [
    {
      title: "First-Time Buyer Journey",
      description: "Complete guide for first-time property buyers",
      icon: <GraduationCap className="h-6 w-6" />,
      videos: videos.filter(v => v.tags.includes('first-time')).length,
      color: "bg-blue-50 text-blue-700"
    },
    {
      title: "Investment Mastery",
      description: "Advanced strategies for property investment",
      icon: <Award className="h-6 w-6" />,
      videos: videos.filter(v => v.category === 'Investment Strategy').length,
      color: "bg-purple-50 text-purple-700"
    },
    {
      title: "Legal & Compliance",
      description: "Understanding legal aspects and RERA compliance",
      icon: <BookOpen className="h-6 w-6" />,
      videos: videos.filter(v => v.category === 'Legal Documentation' || v.category === 'RERA Compliance').length,
      color: "bg-green-50 text-green-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Play className="h-4 w-4 mr-2" />
            Video Education Center
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Master Property Investment
            <span className="text-blue-600"> Through Expert Videos</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Learn from RERA-certified experts with our comprehensive video library. 
            From basic concepts to advanced strategies, we've got your property education covered.
          </p>

          <div className="flex justify-center space-x-6 text-sm text-gray-600 mb-8">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              {videos.length}+ Expert Videos
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              {categories.length} Learning Categories
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              RERA Certified Content
            </div>
          </div>
        </div>
      </section>

      {/* Structured Courses */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Structured Video Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow step-by-step learning journeys designed by experts. From beginner basics to advanced strategies.
            </p>
          </div>

          {(isLoadingCourses || courses.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {!isLoadingCourses ? courses.map((course: Course) => (
                <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <GraduationCap className="h-12 w-12 text-blue-600" />
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge 
                        variant={course.level === 'beginner' ? 'default' : 
                                course.level === 'intermediate' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {course.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{course.category}</Badge>
                      {course.isFeatured && (
                        <Badge className="bg-yellow-500 text-xs">Featured</Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.estimatedDuration || 'Self-paced'}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.enrollmentCount} enrolled
                      </span>
                    </div>

                    <Button 
                      className="w-full"
                      onClick={() => navigate(`/courses/${course.slug}`)}
                    >
                      Start Course
                      <Play className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-3 text-center py-10 text-gray-500">Loading courses...</div>
              )}
            </div>
          )}
          {courses.length === 0 && !isLoadingCourses && (
            <div className="text-center py-10 text-gray-500">No courses available yet.</div>
          )}
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Individual Video Library
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our collection of individual expert videos by topic and difficulty level
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {learningPaths.map((path, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl ${path.color} flex items-center justify-center mb-6`}>
                    {path.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{path.title}</h3>
                  <p className="text-gray-600 mb-4">{path.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{path.videos} videos</span>
                    <Button variant="outline" size="sm">
                      Browse Videos
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              {filteredVideos.length} Video{filteredVideos.length !== 1 ? 's' : ''} Available
            </h2>
            <p className="text-gray-600">
              {searchTerm && `Search results for "${searchTerm}"`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="aspect-video bg-muted relative cursor-pointer"
                     onClick={() => setSelectedVideo(video)}>
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeUrl.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-blue-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getDifficultyColor(video.difficulty)}>
                      {video.difficulty}
                    </Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Eye className="h-3 w-3 mr-1" />
                      {video.viewCount}
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {video.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {video.category}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedVideo(video)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Watch Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>

          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeUrl.split('v=')[1]?.split('&')[0]}?autoplay=1`}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  title={selectedVideo.title}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <Badge className={getDifficultyColor(selectedVideo.difficulty)}>
                    {selectedVideo.difficulty}
                  </Badge>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {selectedVideo.duration}
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {selectedVideo.viewCount} views
                  </span>
                  <Badge variant="outline">{selectedVideo.category}</Badge>
                </div>

                <p className="text-gray-700">{selectedVideo.description}</p>

                <div className="flex flex-wrap gap-2">
                  {selectedVideo.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}