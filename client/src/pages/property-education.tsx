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
import { useLocation } from "wouter";

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
  const [location, setLocation] = useLocation();

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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Minimalist Hero Section */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
            <span className="text-sm tracking-wide text-gray-500 uppercase">Learn Property Investment</span>
            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full ml-3"></span>
          </div>

          <h1 className="text-6xl font-light text-gray-900 mb-8 leading-tight">
            What you don't know
            <br />
            <span className="font-medium text-emerald-600">could cost millions</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Discover the secrets that separate successful property investors from the rest. 
            Expert knowledge, simplified.
          </p>

          <div className="flex justify-center items-center space-x-8 text-xs text-gray-400 mb-16">
            <span>{videos.length} insights</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>RERA certified</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>Expert curated</span>
          </div>
        </div>
      </section>

      {/* Minimalist Course Grid */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-3">
              Complete Learning Journeys
            </h2>
            <div className="w-16 h-0.5 bg-emerald-500"></div>
          </div>

          {(isLoadingCourses || courses.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {!isLoadingCourses ? courses.map((course: Course, index) => (
                <div 
                  key={course.id} 
                  className="group cursor-pointer"
                  onClick={() => setLocation(`/courses/${course.slug}`)}
                >
                  <div className="relative overflow-hidden bg-white border border-gray-100 transition-all duration-500 group-hover:border-emerald-200 group-hover:shadow-lg">
                    {/* Minimalist Header */}
                    <div className="p-8 border-b border-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs tracking-wider text-gray-400 uppercase">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-gray-400">{course.level}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-medium text-gray-900 mb-3 leading-tight group-hover:text-emerald-700 transition-colors">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    {/* Minimalist Footer */}
                    <div className="p-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>{course.enrollmentCount} learning</span>
                          {course.estimatedDuration && (
                            <>
                              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                              <span>{course.estimatedDuration}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight className="h-4 w-4 text-emerald-600" />
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Bar */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-500 group-hover:w-full"></div>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 text-center py-20 text-gray-400">
                  <div className="animate-pulse">Discovering learning paths...</div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Minimalist Learning Categories */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-3">
              Quick Expert Insights
            </h2>
            <div className="w-16 h-0.5 bg-emerald-500"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningPaths.map((path, index) => (
              <div 
                key={index} 
                className="group cursor-pointer p-8 border border-gray-100 transition-all duration-300 hover:border-emerald-200 hover:bg-gray-50"
              >
                <div className="mb-6">
                  <span className="text-xs tracking-wider text-gray-400 uppercase">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                  {path.title}
                </h3>
                
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  {path.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{path.videos} insights</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimalist Search */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="What would you like to learn?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full text-center focus:outline-none focus:border-emerald-300 transition-colors"
              />
              <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          <div className="flex justify-center space-x-8">
            {['all', ...categories.slice(0, 3)].map((category, index) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-sm transition-colors ${
                  selectedCategory === category 
                    ? 'text-emerald-600 border-b border-emerald-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {category === 'all' ? 'All Topics' : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Minimalist Video Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {filteredVideos.length > 0 && (
            <>
              <div className="mb-16">
                <h2 className="text-3xl font-light text-gray-900 mb-3">
                  {filteredVideos.length} expert insights available
                </h2>
                <div className="w-16 h-0.5 bg-emerald-500"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredVideos.map((video, index) => (
                  <div 
                    key={video.id} 
                    className="group cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative overflow-hidden bg-gray-50 border border-gray-100 transition-all duration-500 group-hover:border-emerald-200 group-hover:shadow-lg">
                      {/* Video Thumbnail */}
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeUrl.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        
                        {/* Minimalist Play Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 border border-white/80 rounded-full flex items-center justify-center backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                            <Play className="h-4 w-4 text-white ml-0.5" />
                          </div>
                        </div>

                        {/* Duration Badge */}
                        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                          {video.duration}
                        </div>

                        {/* Category Tag */}
                        <div className="absolute top-4 left-4 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded backdrop-blur-sm">
                          {video.category}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs tracking-wider text-gray-400 uppercase">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              video.difficulty === 'beginner' ? 'bg-green-500' :
                              video.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-xs text-gray-400">{video.difficulty}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-medium text-gray-900 mb-3 leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2">
                          {video.title}
                        </h3>
                        
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-6">
                          {video.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-xs text-gray-400">
                            <span>{video.viewCount} views</span>
                          </div>
                          
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ArrowRight className="h-4 w-4 text-emerald-600" />
                          </div>
                        </div>
                      </div>

                      {/* Hover Effect Bar */}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-500 group-hover:w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {filteredVideos.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">No insights found for your search</div>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="text-emerald-600 text-sm hover:text-emerald-700 transition-colors"
              >
                Browse all insights
              </button>
            </div>
          )}
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