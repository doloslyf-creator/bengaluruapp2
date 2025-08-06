import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Share2, 
  Grid3X3, 
  X,
  Camera,
  Video,
  Maximize2
} from 'lucide-react';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  title?: string;
  description?: string;
}

interface PropertyGalleryProps {
  images?: string[];
  videos?: string[];
  propertyName?: string;
  className?: string;
}

export function PropertyGallery({ 
  images = [], 
  videos = [], 
  propertyName = "Property",
  className = ""
}: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  // Combine videos and images into media items
  const mediaItems: MediaItem[] = [
    ...videos.map(url => ({ type: 'video' as const, url })),
    ...images.map(url => ({ type: 'image' as const, url }))
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            goToPrevious();
            break;
          case 'ArrowRight':
            e.preventDefault();
            goToNext();
            break;
          case 'Escape':
            e.preventDefault();
            setIsFullscreen(false);
            break;
          case '+':
          case '=':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
        }
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, activeIndex]);

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % mediaItems.length);
    resetZoom();
  };

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    resetZoom();
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.5, 1);
    setZoomLevel(newZoom);
    if (newZoom === 1) {
      setIsZoomed(false);
      setPanPosition({ x: 0, y: 0 });
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (mediaItems[activeIndex]?.type === 'image') {
      if (!isZoomed) {
        handleZoomIn();
      } else {
        // Pan functionality when zoomed
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setPanPosition({
          x: (0.5 - x) * (zoomLevel - 1) * 100,
          y: (0.5 - y) * (zoomLevel - 1) * 100
        });
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share && mediaItems[activeIndex]) {
      try {
        await navigator.share({
          title: `${propertyName} - Image ${activeIndex + 1}`,
          url: mediaItems[activeIndex].url
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard?.writeText(mediaItems[activeIndex].url);
      }
    }
  };

  const handleDownload = () => {
    const currentMedia = mediaItems[activeIndex];
    if (currentMedia?.type === 'image') {
      const link = document.createElement('a');
      link.href = currentMedia.url;
      link.download = `${propertyName.replace(/\s+/g, '_')}_image_${activeIndex + 1}.jpg`;
      link.click();
    }
  };

  const extractYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  };

  if (mediaItems.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <Camera className="h-16 w-16 mx-auto mb-4" />
            <p className="text-xl font-medium">No Images Available</p>
            <p className="text-sm">Property images coming soon</p>
          </div>
        </div>
      </div>
    );
  }

  const currentMedia = mediaItems[activeIndex];

  return (
    <div className={`relative ${className}`}>
      {/* Main Gallery */}
      <div className="relative">
        {/* Main Media Display */}
        <div 
          className="relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer group"
          onClick={handleImageClick}
          data-testid="main-gallery-display"
        >
          {currentMedia.type === 'video' ? (
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeVideoId(currentMedia.url)}`}
              title={`${propertyName} - Video`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img 
              src={currentMedia.url} 
              alt={`${propertyName} - Image ${activeIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{
                transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                cursor: isZoomed ? 'move' : 'zoom-in'
              }}
              draggable={false}
            />
          )}

          {/* Media Type Badge */}
          <Badge 
            className="absolute top-4 left-4 bg-black/70 text-white border-0"
            data-testid="media-type-badge"
          >
            {currentMedia.type === 'video' ? (
              <>
                <Video className="h-3 w-3 mr-1" />
                Video
              </>
            ) : (
              <>
                <Camera className="h-3 w-3 mr-1" />
                Photo {activeIndex - videos.length + 1} of {images.length}
              </>
            )}
          </Badge>

          {/* Navigation Arrows */}
          {mediaItems.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                data-testid="previous-button"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                data-testid="next-button"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Control Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {currentMedia.type === 'image' && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    isZoomed ? handleZoomOut() : handleZoomIn();
                  }}
                  data-testid="zoom-button"
                >
                  {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  data-testid="download-button"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="bg-black/50 hover:bg-black/70 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              data-testid="share-button"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-black/50 hover:bg-black/70 text-white"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(true);
              }}
              data-testid="fullscreen-button"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Media Counter */}
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-black/70 text-white border-0" data-testid="media-counter">
              {activeIndex + 1} / {mediaItems.length}
            </Badge>
          </div>

          {/* Zoom Instructions */}
          {currentMedia.type === 'image' && !isZoomed && (
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge className="bg-black/70 text-white border-0 text-xs">
                Click to zoom
              </Badge>
            </div>
          )}
        </div>

        {/* Thumbnail Gallery Toggle */}
        {mediaItems.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            className="absolute -bottom-12 right-0 mt-2"
            onClick={() => setShowThumbnails(!showThumbnails)}
            data-testid="thumbnail-toggle"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            {showThumbnails ? 'Hide' : 'Show'} Thumbnails
          </Button>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {showThumbnails && mediaItems.length > 1 && (
        <div className="mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2" data-testid="thumbnail-gallery">
            {mediaItems.map((item, index) => (
              <Card
                key={index}
                className={`flex-shrink-0 w-20 h-16 cursor-pointer transition-all duration-200 hover:scale-105 ${
                  index === activeIndex 
                    ? 'ring-2 ring-blue-500 ring-offset-2' 
                    : 'hover:ring-1 hover:ring-gray-300'
                }`}
                onClick={() => {
                  setActiveIndex(index);
                  resetZoom();
                }}
                data-testid={`thumbnail-${index}`}
              >
                <div className="relative w-full h-full overflow-hidden rounded">
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <img 
                      src={item.url} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {index === activeIndex && (
                    <div className="absolute inset-0 bg-blue-500/20" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => setIsFullscreen(false)}
            data-testid="fullscreen-close"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Fullscreen Media */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={handleImageClick}
          >
            {currentMedia.type === 'video' ? (
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeVideoId(currentMedia.url)}`}
                title={`${propertyName} - Video`}
                className="w-full h-full max-w-6xl max-h-[90vh]"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img 
                src={currentMedia.url} 
                alt={`${propertyName} - Image ${activeIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                  cursor: isZoomed ? 'move' : 'zoom-in'
                }}
                draggable={false}
              />
            )}

            {/* Fullscreen Navigation */}
            {mediaItems.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="lg"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Fullscreen Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {currentMedia.type === 'image' && (
                <>
                  <Button
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoomOut();
                    }}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoomIn();
                    }}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Badge className="bg-black/70 text-white border-0">
                {activeIndex + 1} / {mediaItems.length}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}