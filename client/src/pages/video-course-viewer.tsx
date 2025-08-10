
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  CheckCircle, 
  Lock, 
  Clock, 
  Eye, 
  BookOpen, 
  Target, 
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  User,
  Mail
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { updateMetaTags } from "@/utils/seo";

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
  enrollmentCount: number;
  metaTitle?: string;
  metaDescription?: string;
}

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
  viewCount: number;
}

interface CourseEnrollment {
  id: string;
  courseId: string;
  userEmail: string;
  userName?: string;
  currentChapterId?: string;
  completedChapters: string[];
  progressPercentage: number;
  enrolledAt: string;
  lastAccessedAt?: string;
}

export default function VideoCourseViewer() {
  const [match, params] = useRoute("/courses/:courseSlug");
  const courseSlug = params?.courseSlug;
  const [location, setLocation] = useLocation();
  const [selectedChapter, setSelectedChapter] = useState<VideoChapter | null>(null);
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({
    userEmail: '',
    userName: ''
  });
  const [userEmail, setUserEmail] = useState<string | null>(
    localStorage.getItem('courseUserEmail')
  );

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch course by slug
  const { data: course, isLoading: courseLoading } = useQuery<VideoCourse>({
    queryKey: [`/api/video-courses/slug/${courseSlug}`],
    enabled: !!courseSlug
  });

  // Fetch chapters for this course
  const { data: chapters = [], isLoading: chaptersLoading } = useQuery<VideoChapter[]>({
    queryKey: [`/api/video-courses/${course?.id}/chapters/public`],
    enabled: !!course?.id
  });

  // Fetch enrollment status
  const { data: enrollment } = useQuery<CourseEnrollment>({
    queryKey: [`/api/video-courses/${course?.id}/enrollment/${userEmail}`],
    enabled: !!course?.id && !!userEmail,
    retry: false
  });

  const enrollMutation = useMutation({
    mutationFn: async (data: { userEmail: string; userName: string }) => {
      const response = await fetch(`/api/video-courses/${course?.id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to enroll");
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('courseUserEmail', enrollmentData.userEmail);
      setUserEmail(enrollmentData.userEmail);
      queryClient.invalidateQueries({ 
        queryKey: [`/api/video-courses/${course?.id}/enrollment/${enrollmentData.userEmail}`] 
      });
      setIsEnrollmentDialogOpen(false);
      toast({ title: "Successfully enrolled in course!" });
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { 
      currentChapterId: string;
      completedChapters: string[];
      progressPercentage: number;
    }) => {
      const response = await fetch(`/api/course-enrollments/${enrollment?.id}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update progress");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/video-courses/${course?.id}/enrollment/${userEmail}`] 
      });
    }
  });

  const viewChapterMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      const response = await fetch(`/api/video-chapters/${chapterId}/view`, {
        method: "POST"
      });
      if (!response.ok) throw new Error("Failed to update view count");
      return response.json();
    }
  });

  const handleEnrollment = () => {
    enrollMutation.mutate(enrollmentData);
  };

  const handleChapterSelect = (chapter: VideoChapter) => {
    setSelectedChapter(chapter);
    viewChapterMutation.mutate(chapter.id);
    
    if (enrollment) {
      const completedChapters = enrollment.completedChapters;
      if (!completedChapters.includes(chapter.id)) {
        completedChapters.push(chapter.id);
      }
      
      const progressPercentage = Math.round((completedChapters.length / chapters.length) * 100);
      
      updateProgressMutation.mutate({
        currentChapterId: chapter.id,
        completedChapters,
        progressPercentage
      });
    }
  };

  const getNextChapter = () => {
    if (!selectedChapter) return null;
    const currentIndex = sortedChapters.findIndex(c => c.id === selectedChapter.id);
    return sortedChapters[currentIndex + 1] || null;
  };

  const getPrevChapter = () => {
    if (!selectedChapter) return null;
    const currentIndex = sortedChapters.findIndex(c => c.id === selectedChapter.id);
    return sortedChapters[currentIndex - 1] || null;
  };

  // Set first chapter as selected by default
  useEffect(() => {
    if (chapters.length > 0 && !selectedChapter) {
      const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
      setSelectedChapter(sortedChapters[0]);
    }
  }, [chapters, selectedChapter]);

  // Update meta tags
  useEffect(() => {
    if (course) {
      updateMetaTags(
        course.metaTitle || `${course.title} - Video Course | OwnitWise`,
        course.metaDescription || course.description,
        `video course, ${course.tags.join(', ')}, property education`,
        course.thumbnailUrl,
        window.location.href
      );
    }
  }, [course]);

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-8">The requested course could not be found.</p>
            <Button onClick={() => setLocation('/property-education')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Education Center
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const isEnrolled = !!enrollment;
  const canViewChapter = (chapter: VideoChapter) => chapter.isPreview || isEnrolled;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Minimalist Course Header */}
      <section className="py-16 px-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <button 
              onClick={() => setLocation('/property-education')}
              className="text-sm text-gray-400 hover:text-emerald-600 transition-colors"
            >
              ← Back to insights
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-2 h-2 rounded-full ${
                    course.level === 'beginner' ? 'bg-green-500' :
                    course.level === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs tracking-wider text-gray-400 uppercase">{course.level}</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="text-xs text-gray-400">{course.category}</span>
                </div>
                
                <h1 className="text-4xl font-light text-gray-900 mb-6 leading-tight">
                  {course.title}
                </h1>
                
                <p className="text-lg text-gray-500 leading-relaxed mb-8">
                  {course.description}
                </p>
                
                <div className="flex items-center space-x-8 text-xs text-gray-400">
                  <span>{course.enrollmentCount} learning</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span>{chapters.length} chapters</span>
                  {course.estimatedDuration && (
                    <>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <span>{course.estimatedDuration}</span>
                    </>
                  )}
                </div>
              </div>

              {isEnrolled && enrollment && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Progress</span>
                    <span className="text-sm text-emerald-600 font-medium">{enrollment.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${enrollment.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {!isEnrolled && (
                <div className="mb-8">
                  <button 
                    onClick={() => setIsEnrollmentDialogOpen(true)}
                    className="group inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <span className="text-sm font-medium">Start learning now</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-1">
              {course.thumbnailUrl ? (
                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="xl:col-span-2">
            {selectedChapter && canViewChapter(selectedChapter) ? (
              <div className="w-full">
                <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-8 shadow-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedChapter.youtubeUrl.split('v=')[1]?.split('&')[0]}`}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedChapter.title}
                  />
                </div>
                
                {/* Minimalist Chapter Info */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs tracking-wider text-gray-400 uppercase">
                        Chapter {String(selectedChapter.chapterNumber).padStart(2, '0')}
                      </span>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <span className="text-xs text-gray-400">{selectedChapter.duration}</span>
                    </div>
                    <span className="text-xs text-gray-400">{selectedChapter.viewCount} views</span>
                  </div>
                  
                  <h2 className="text-2xl font-light text-gray-900 mb-4 leading-tight">
                    {selectedChapter.title}
                  </h2>
                  
                  {selectedChapter.description && (
                    <p className="text-gray-500 leading-relaxed mb-6">{selectedChapter.description}</p>
                  )}
                  
                  {selectedChapter.learningObjectives.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-800 mb-3">What you'll learn</h3>
                      <ul className="space-y-2">
                        {selectedChapter.learningObjectives.map((objective, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedChapter.keyTakeaways.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-medium text-gray-800 mb-3">Key insights</h3>
                      <ul className="space-y-2">
                        {selectedChapter.keyTakeaways.map((takeaway, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            {takeaway}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Minimalist Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      const prev = getPrevChapter();
                      if (prev) handleChapterSelect(prev);
                    }}
                    disabled={!getPrevChapter()}
                    className={`group inline-flex items-center space-x-2 text-sm transition-colors ${
                      getPrevChapter() 
                        ? 'text-gray-600 hover:text-emerald-600' 
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <ArrowLeft className={`h-4 w-4 transition-transform ${
                      getPrevChapter() ? 'group-hover:-translate-x-1' : ''
                    }`} />
                    <span>Previous</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const next = getNextChapter();
                      if (next) handleChapterSelect(next);
                    }}
                    disabled={!getNextChapter()}
                    className={`group inline-flex items-center space-x-2 text-sm transition-colors ${
                      getNextChapter() 
                        ? 'text-gray-600 hover:text-emerald-600' 
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <span>Next</span>
                    <ArrowRight className={`h-4 w-4 transition-transform ${
                      getNextChapter() ? 'group-hover:translate-x-1' : ''
                    }`} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-50 rounded-2xl flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Lock className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-light text-gray-900 mb-3">Chapter Locked</h3>
                  <p className="text-gray-500 leading-relaxed mb-6">
                    Start your learning journey to unlock this content
                  </p>
                  <button 
                    onClick={() => setIsEnrollmentDialogOpen(true)}
                    className="group inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <span className="text-sm font-medium">Enroll now</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Minimalist Chapter List */}
          <div className="w-full">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-light text-gray-900 mb-2">Course Content</h3>
                <div className="w-12 h-0.5 bg-emerald-500"></div>
              </div>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {sortedChapters.map((chapter, index) => (
                  <div
                    key={chapter.id}
                    className={`group cursor-pointer p-4 rounded-xl transition-all duration-300 ${
                      selectedChapter?.id === chapter.id
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-sm'
                    } ${!canViewChapter(chapter) ? 'opacity-60' : ''}`}
                    onClick={() => {
                      if (canViewChapter(chapter)) {
                        handleChapterSelect(chapter);
                      } else {
                        setIsEnrollmentDialogOpen(true);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs tracking-wider text-gray-400 uppercase">
                            {String(chapter.chapterNumber).padStart(2, '0')}
                          </span>
                          <div className="flex items-center space-x-2">
                            {chapter.isPreview && (
                              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Free</span>
                            )}
                            {!canViewChapter(chapter) && (
                              <Lock className="h-3 w-3 text-gray-400" />
                            )}
                            {enrollment?.completedChapters.includes(chapter.id) && (
                              <CheckCircle className="h-3 w-3 text-emerald-600" />
                            )}
                          </div>
                        </div>
                        
                        <h4 className={`font-medium text-sm leading-tight mb-2 transition-colors ${
                          selectedChapter?.id === chapter.id ? 'text-emerald-700' : 'text-gray-900 group-hover:text-emerald-700'
                        }`}>
                          {chapter.title}
                        </h4>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{chapter.duration}</span>
                          {canViewChapter(chapter) && (
                            <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                              selectedChapter?.id === chapter.id ? 'opacity-100' : ''
                            }`}>
                              <Play className="h-3 w-3 text-emerald-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Enrollment Dialog */}
      {isEnrollmentDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-light text-gray-900 mb-3">Start Learning</h3>
              <p className="text-gray-500 leading-relaxed">
                Get instant access to all course content. No credit card required.
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <input
                  type="email"
                  value={enrollmentData.userEmail}
                  onChange={(e) => setEnrollmentData({ ...enrollmentData, userEmail: e.target.value })}
                  placeholder="Email address"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                  required
                />
              </div>
              
              <div>
                <input
                  value={enrollmentData.userName}
                  onChange={(e) => setEnrollmentData({ ...enrollmentData, userName: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-8">
              <button 
                onClick={() => setIsEnrollmentDialogOpen(false)}
                className="flex-1 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Maybe later
              </button>
              <button 
                onClick={handleEnrollment}
                disabled={!enrollmentData.userEmail || !enrollmentData.userName || enrollMutation.isPending}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrollMutation.isPending ? 'Starting...' : 'Start Learning'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
