
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/property-education')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Education Center
          </Button>
          
          <div className="flex items-start gap-6 mb-6">
            <div className="w-48 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="h-12 w-12 text-blue-600" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant={course.level === 'beginner' ? 'default' : 
                          course.level === 'intermediate' ? 'secondary' : 'destructive'}
                >
                  {course.level}
                </Badge>
                <Badge variant="outline">{course.category}</Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.estimatedDuration || 'Self-paced'}
                </span>
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {course.enrollmentCount} enrolled
                </span>
                <span className="flex items-center">
                  <Play className="h-4 w-4 mr-1" />
                  {chapters.length} chapters
                </span>
              </div>
              
              {isEnrolled && enrollment && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Course Progress</span>
                    <span className="text-sm text-gray-600">{enrollment.progressPercentage}%</span>
                  </div>
                  <Progress value={enrollment.progressPercentage} className="h-2" />
                </div>
              )}
              
              {!isEnrolled && (
                <Button 
                  onClick={() => setIsEnrollmentDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Enroll in Course - Free
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            {selectedChapter && canViewChapter(selectedChapter) ? (
              <div>
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedChapter.youtubeUrl.split('v=')[1]?.split('&')[0]}`}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedChapter.title}
                  />
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">
                      Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{selectedChapter.duration}</span>
                      <span className="text-sm text-gray-500">{selectedChapter.viewCount} views</span>
                    </div>
                  </div>
                  
                  {selectedChapter.description && (
                    <p className="text-gray-600 mb-4">{selectedChapter.description}</p>
                  )}
                  
                  {selectedChapter.learningObjectives.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Learning Objectives
                      </h3>
                      <ul className="space-y-1">
                        {selectedChapter.learningObjectives.map((objective, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedChapter.keyTakeaways.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Key Takeaways
                      </h3>
                      <ul className="space-y-1">
                        {selectedChapter.keyTakeaways.map((takeaway, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-green-600" />
                            {takeaway}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const prev = getPrevChapter();
                      if (prev) handleChapterSelect(prev);
                    }}
                    disabled={!getPrevChapter()}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous Chapter
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const next = getNextChapter();
                      if (next) handleChapterSelect(next);
                    }}
                    disabled={!getNextChapter()}
                  >
                    Next Chapter
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chapter Locked</h3>
                  <p className="text-gray-600 mb-4">Enroll in the course to access this chapter</p>
                  <Button onClick={() => setIsEnrollmentDialogOpen(true)}>
                    Enroll Now - Free
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Chapter List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Chapters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sortedChapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedChapter?.id === chapter.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">Chapter {chapter.chapterNumber}</span>
                          {chapter.isPreview && (
                            <Badge variant="outline" className="text-xs">Free</Badge>
                          )}
                          {!canViewChapter(chapter) && (
                            <Lock className="h-3 w-3 text-gray-400" />
                          )}
                          {enrollment?.completedChapters.includes(chapter.id) && (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2">{chapter.title}</h4>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {chapter.duration}
                        </div>
                      </div>
                      {canViewChapter(chapter) && (
                        <Play className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enrollment Dialog */}
      {isEnrollmentDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Enroll in Course</h3>
            <p className="text-gray-600 mb-4">
              Get free access to all course chapters by providing your details.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <Input
                  type="email"
                  value={enrollmentData.userEmail}
                  onChange={(e) => setEnrollmentData({ ...enrollmentData, userEmail: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input
                  value={enrollmentData.userName}
                  onChange={(e) => setEnrollmentData({ ...enrollmentData, userName: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsEnrollmentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEnrollment}
                disabled={!enrollmentData.userEmail || !enrollmentData.userName || enrollMutation.isPending}
              >
                {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
