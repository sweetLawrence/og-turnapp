import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { EventImagePlaceholder } from '../components/EventImagePlaceholder';
import { OrganizerCard } from '../components/OrganizerCard';
import { ImageLightbox } from '../components/ImageLightbox';
import { ContactActions } from '../components/ContactActions';
import { eventApi } from '../services/eventApi';
import { checkoutApi } from '../services/checkoutApi';
import { transformEventDetails } from '../utils/eventTransformer';
import { Calendar, MapPin, Minus, Plus, Ticket, Loader2, Share2, Heart, Maximize2, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const INSTAGRAM_BROWSER_MESSAGE = 'Tap below to proceed.';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [event, setEvent] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [timeLeft, setTimeLeft] = useState({});
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);
  const descriptionRef = useRef(null);

  // Load event data from API
  useEffect(() => {
    loadEvent();
  }, [id]);

  // Track affiliate referral click and store referral code for checkout attribution
  useEffect(() => {
    const ref = searchParams.get('ref') || searchParams.get('affiliate');
    if (ref && id) {
      // Store referral code in localStorage for checkout attribution
      localStorage.setItem('affiliate_ref', JSON.stringify({
        code: ref,
        event_id: id,
        timestamp: Date.now(),
      }));

      fetch(`${API_BASE_URL}/track-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          ref,
          event_id: id,
          referrer_url: document.referrer || null,
        }),
      }).catch(() => {}); // Fire and forget — don't block the page
    }
  }, [id, searchParams]);

  // Debug: Log event data when it changes
  useEffect(() => {
    if (event) {
      console.log('Event data loaded:', {
        title: event.title,
        eventType: event.eventType,
        externalLink: event.externalLink,
        priceFrom: event.priceFrom,
        currency: event.currency,
        tickets: event.tickets,
        ticketsCount: event.tickets?.length,
        images: event.images,
        image: event.image,
        hasMultipleImages: event.images && event.images.length > 1,
        shouldShowTickets: !(event.eventType === 'experience' && !event.externalLink && (!event.tickets || event.tickets.length === 0))
      });
    }
  }, [event]);

  // Update page title (OG meta tags must be served by the backend for social previews)
  useEffect(() => {
    if (!event) return;
    document.title = `${event.title} - TurnApp`;
    return () => {
      document.title = 'TurnApp - Discover Events';
    };
  }, [event]);

  const loadEvent = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await eventApi.getEvent(id);
      
      if (response.success) {
        const transformedEvent = transformEventDetails(response.data);        
        setEvent(transformedEvent);
        
      } else {
        if (/Instagram/i.test(navigator.userAgent)) {
          setLoadError(INSTAGRAM_BROWSER_MESSAGE);
        } else {
          toast.error('Event not found');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error loading event:', error);
      if (/Instagram/i.test(navigator.userAgent)) {
        setLoadError(INSTAGRAM_BROWSER_MESSAGE);
      } else {
        toast.error('Failed to load event details');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!event) return;

    const calculateTimeLeft = () => {
      const eventDate = new Date(event.date + 'T' + event.time);
      const now = new Date();
      const difference = eventDate - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return {};
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [event]);

  // Check if description content actually overflows the collapsed container
  const checkDescriptionOverflow = useCallback(() => {
    if (descriptionRef.current) {
      const el = descriptionRef.current;
      // scrollHeight is the full content height; clientHeight is the visible height
      setIsDescriptionOverflowing(el.scrollHeight > el.clientHeight + 4);
    }
  }, []);

  useEffect(() => {
    if (event?.description) {
      // Wait for render + images/fonts to load before measuring
      const timer = setTimeout(checkDescriptionOverflow, 100);
      window.addEventListener('resize', checkDescriptionOverflow);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkDescriptionOverflow);
      };
    }
  }, [event?.description, checkDescriptionOverflow]);

  const updateTicketQuantity = (ticketId, change) => {
    setSelectedTickets(prev => {
      const currentQty = prev[ticketId] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      if (newQty === 0) {
        const { [ticketId]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [ticketId]: newQty };
    });
  };

  const calculateTotal = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = event.tickets.find(t => t.id === ticketId);
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  const handleCheckout = async () => {
    const selectedTicketsList = Object.entries(selectedTickets)
      .map(([ticketId, quantity]) => {
        const ticket = event.tickets.find(t => t.id === ticketId);
        return ticket ? { ...ticket, quantity } : null;
      })
      .filter(Boolean);

    if (selectedTicketsList.length === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    // Validate cart before proceeding
    try {
      const validation = await checkoutApi.validateCart();
      if (!validation.success) {
        toast.error(validation.message || 'Cart validation failed');
        return;
      }
    } catch (error) {
      console.error('Cart validation error:', error);
      toast.error('Failed to validate cart');
      return;
    }

    navigate('/checkout', { 
      state: { 
        event, 
        selectedTickets: selectedTicketsList,
        total: calculateTotal()
      } 
    });
  };

  // Handle touch events for swipe navigation
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (event.images && event.images.length > 1) {
      if (isLeftSwipe) {
        // Swipe left - next image
        setCurrentImageIndex(prev => prev < event.images.length - 1 ? prev + 1 : 0);
      }
      if (isRightSwipe) {
        // Swipe right - previous image
        setCurrentImageIndex(prev => prev > 0 ? prev - 1 : event.images.length - 1);
      }
    }
  };

  const handleShare = async () => {
      if (!event) return;

      // Share the frontend URL directly.
      // Vercel rewrites /event/:id to the backend SocialShareController for
      // social-media crawlers, which serves HTML with OG meta tags (image,
      // description, location). Normal visitors get the SPA as usual.
      const shareUrl = `${window.location.origin}/events/${event.uuid || id}`;

      const eventTitle = event.title;

      // Clean description from HTML tags and limit length
      const cleanDescription = (event.shortDescription ||
        event.description?.replace(/<[^>]*>/g, '').substring(0, 150) ||
        'Check out this amazing event!').trim();

      const eventLocation = event.venue || '';
      const eventDate = new Date(event.date).toLocaleDateString('en-KE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const eventTime = event.time?.substring(0, 5) || '';

      // Build rich share text — keep it concise so the OG preview card stands out
      const shareText = [
        `🎉 *${eventTitle}*`,
        '',
        cleanDescription,
        '',
        `📍 ${eventLocation}`,
        `📅 ${eventDate}${eventTime ? ` at ${eventTime}` : ''}`,
        '',
        `🎟️ Get your tickets:`,
        shareUrl,
      ].join('\n');

      // Try Web Share API first (mobile devices)
      if (navigator.share) {
        try {
          // Only pass url so the platform crawls it for OG metadata;
          // include title + text for platforms that display them inline.
          await navigator.share({
            title: eventTitle,
            text: shareText,
          });
          toast.success('Event shared successfully!');
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error sharing via Web Share API:', error);
            await copyToClipboard(shareText);
          }
        }
      } else {
        await copyToClipboard(shareText);
      }
    };

    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('Event details copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy. Please try again.');
      }
    };

  const handleSaveToCalendar = () => {
    if (!event) return;

    try {
      // Create calendar event details
      const eventDate = new Date(event.date + 'T' + event.time);
      const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // Assume 3 hours duration

      // Format dates for calendar (YYYYMMDDTHHMMSS)
      const formatCalendarDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const startTime = formatCalendarDate(eventDate);
      const endTime = formatCalendarDate(endDate);

      // Create calendar description
      const description = event.shortDescription || event.description.replace(/<[^>]*>/g, '').substring(0, 200);
      
      // Google Calendar URL
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(event.venue)}&sf=true&output=xml`;

      // Open Google Calendar in new tab
      window.open(googleCalendarUrl, '_blank');

      // Toggle favorite state
      setIsFavorite(!isFavorite);
      
      if (!isFavorite) {
        toast.success('Event saved to calendar!');
      } else {
        toast.info('Opening calendar...');
      }
    } catch (error) {
      console.error('Error saving to calendar:', error);
      toast.error('Failed to save to calendar. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        </div>
      </div>
    );
  }

  if (!event && loadError) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-black px-6 py-12 text-white">
        <div className="flex w-full max-w-lg flex-col items-center text-center">
          <img
            src="/images/turnapp-logo.png"
            alt="Turn App"
            className="mb-14 h-36 w-36 object-contain sm:h-44 sm:w-44"
          />

          <h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            Almost there
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-white/60 sm:text-xl" role="status">
            {INSTAGRAM_BROWSER_MESSAGE}
          </p>

          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer external"
            className="red-glow mx-auto mt-10 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          >
            Continue
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
          </a>

          <p className="mt-10 max-w-sm text-base leading-7 text-white/50">
            If nothing happens, tap <span className="text-lg leading-none text-white/70" aria-label="the menu">⋮</span> in the
            top right and choose <span className="text-white/70">Open in Browser</span>.
          </p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg px-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event not found</h1>
          <Button onClick={() => navigate('/')}>Back to Events</Button>
        </div>
      </div>
    );
  }

  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <ContactActions />

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={event.images && event.images.length > 0 ? event.images[currentImageIndex] : event.image}
        title={event.title}
      />

      {/* Hero Image */}
      <div className="relative h-[400px] mt-16 group">
        {((event.images && event.images.length > 0) || (event.image && event.image !== '/placeholder-event.jpg')) && !imageError ? (
          <>
            {/* Main Image Display */}
            <img
              src={event.images && event.images.length > 0 ? event.images[currentImageIndex] : event.image}
              alt={event.title}
              className={`w-full h-full object-cover smooth-transition cursor-pointer ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(false);
              }}
              onClick={() => setLightboxOpen(true)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
            {!imageLoaded && (
              <EventImagePlaceholder 
                title={event.title} 
                category={event.category}
                className="absolute inset-0"
              />
            )}
            
            
            {/* View Full Image Button */}
            {imageLoaded && (
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/5"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="text-sm font-medium">View Full Image</span>
              </button>
            )}
            
            {/* Share and Calendar Buttons - Mobile Only */}
            <div className="absolute top-4 right-4 flex gap-2 sm:hidden pointer-events-auto z-20">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSaveToCalendar}
                className={`h-10 w-10 border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-red-600 transition-all ${
                  isFavorite 
                    ? 'bg-red-600/30 border-red-600 text-red-600' 
                    : 'bg-black/50 text-white'
                }`}
                title="Save to calendar"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="h-10 w-10 border-white/10 bg-black/50 text-white hover:bg-white/10 hover:border-red-600 backdrop-blur-md"
                title="Share event"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <EventImagePlaceholder 
              title={event.title} 
              category={event.category}
              className="w-full h-full"
            />
            {/* Share and Calendar Buttons - Mobile Only (for placeholder) */}
            <div className="absolute top-4 right-4 flex gap-2 sm:hidden pointer-events-auto z-20">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSaveToCalendar}
                className={`h-10 w-10 border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-red-600 transition-all ${
                  isFavorite 
                    ? 'bg-red-600/30 border-red-600 text-red-600' 
                    : 'bg-black/50 text-white'
                }`}
                title="Save to calendar"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="h-10 w-10 border-white/10 bg-black/50 text-white hover:bg-white/10 hover:border-red-600 backdrop-blur-md"
                title="Share event"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className={`grid grid-cols-1 gap-8 ${
          (event.eventType === 'experience' && !event.externalLink && (!event.tickets || event.tickets.length === 0))
            ? 'lg:grid-cols-1 max-w-5xl mx-auto'
            : 'lg:grid-cols-3'
        }`}>
          {/* Left Column - Event Details */}
          <div className={`space-y-6 ${
            (event.eventType === 'experience' && !event.externalLink && (!event.tickets || event.tickets.length === 0))
              ? ''
              : 'lg:col-span-2'
          }`}>
            {/* Title and Meta */}
            <div className="glass rounded-xl p-6 sm:p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {event.featured && (
                  <Badge className="bg-gradient-to-r from-red-700 to-red-800 text-white border-0 text-[10px] px-1.5 py-0">FEATURED</Badge>
                )}
                <Badge variant="outline" className="border-red-700 bg-transparent text-red-700 hover:bg-red-700/10 text-[10px] sm:text-xs px-3 py-1 rounded-sm font-normal transition-colors">
                  {event.category.toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex-1">
                  {event.title}
                </h1>
                {/* Desktop Only Buttons */}
                <div className="hidden sm:flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSaveToCalendar}
                    className={`h-8 w-8 border-white/5 hover:bg-white/10 hover:border-red-600 transition-all ${
                      isFavorite 
                        ? 'bg-red-600/20 border-red-600 text-red-600' 
                        : 'text-white'
                    }`}
                    title="Save to calendar"
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="h-8 w-8 border-white/5 text-white hover:bg-white/10 hover:border-red-600"
                    title="Share event"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-red-700 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white font-medium text-xs sm:text-sm">
                      {new Date(event.date).toLocaleDateString('en-KE', { 
                        day: 'numeric',
                        month: 'short', 
                        year: 'numeric'
                      })}
                      {event.endDate && event.endDate !== event.date && (
                        <> - {new Date(event.endDate).toLocaleDateString('en-KE', { 
                          day: 'numeric',
                          month: 'short', 
                          year: 'numeric'
                        })}</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-red-700 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white font-medium text-xs sm:text-sm">
                      {event.time?.substring(0, 5)}{event.endTime ? ` - ${event.endTime.substring(0, 5)}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-red-700 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-xs sm:text-sm line-clamp-2">
                      {event.venue}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown Timer and Organizer - Side by Side on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Countdown Timer */}
              {Object.keys(timeLeft).length > 0 && (
                <div className="glass rounded-xl p-4 sm:p-6 h-full">
                  <h3 className="text-sm font-semibold text-white mb-3 sm:mb-4">Event Starts In</h3>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {Object.entries(timeLeft).map(([unit, value]) => (
                      <div key={unit} className="text-center">
                        <div className="bg-gradient-red hover:opacity-90 text-white red-glow rounded-lg p-1.5 sm:p-3 mb-1 sm:mb-2">
                          <p className="text-base sm:text-lg lg:text-xl font-bold text-white">{value}</p>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{unit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizer Profile Card - Hidden on mobile, shown on desktop */}
              {event.organizer && event.userId && (
                <div className="hidden lg:block h-full">
                  <OrganizerCard organizer={event.organizer} userId={event.userId} />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="glass rounded-xl p-4 sm:p-6 lg:p-8">
              <h2 className="text-sm font-bold text-white mb-3 sm:mb-4">About This Event</h2>
              <div className="relative">
                <div
                  ref={descriptionRef}
                  className={`text-sm text-muted-foreground leading-relaxed prose prose-invert prose-p:text-muted-foreground prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline max-w-none transition-[max-height] duration-300 ease-in-out overflow-hidden ${
                    showFullDescription ? 'max-h-[none]' : 'max-h-[9rem]'
                  }`}
                  style={{
                    overflowWrap: 'break-word',
                    wordBreak: 'normal',
                    maxHeight: showFullDescription ? `${descriptionRef.current?.scrollHeight || 9999}px` : '9rem',
                  }}
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
                {/* Fade gradient when collapsed and content overflows */}
                {!showFullDescription && isDescriptionOverflowing && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--glass-bg,rgba(0,0,0,0.6))] to-transparent pointer-events-none" />
                )}
                {isDescriptionOverflowing && (
                  <button
                    onClick={() => setShowFullDescription(prev => !prev)}
                    className="mt-3 text-xs text-muted-foreground hover:text-white hover:underline inline-flex items-center gap-1 transition-colors relative z-10"
                  >
                    {showFullDescription ? (
                      <>
                        Read Less
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Read More
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Organizer Profile Card - Shown on mobile only */}
            {event.organizer && event.userId && (
              <div className="lg:hidden">
                <OrganizerCard organizer={event.organizer} userId={event.userId} />
              </div>
            )}

            {/* Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <div className="glass rounded-xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-sm font-bold text-white mb-3 sm:mb-4">Event Highlights</h2>
                <ul className="space-y-2 sm:space-y-3">
                  {event.highlights.map((highlight, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-muted-foreground mt-1 text-xs">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lineup */}
            {event.lineup && event.lineup.length > 0 && (
              <div className="glass rounded-xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-sm font-bold text-white mb-3 sm:mb-4">Lineup</h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {event.lineup.map((artist, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="border-white/10 bg-transparent text-muted-foreground px-3 py-1.5 sm:px-4 sm:py-2 text-xs"
                    >
                      {artist}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Ticket Selection, External Link, or Organizer for Remote Experiences */}
          {(event.eventType === 'experience' && !event.externalLink && (!event.tickets || event.tickets.length === 0)) ? (
            // For remote experiences without tickets/external link, show organizer in right column on desktop
            event.organizer && event.userId ? (
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24">
                  <OrganizerCard organizer={event.organizer} userId={event.userId} />
                </div>
              </div>
            ) : null
          ) : (
            <div className="lg:col-span-1">
              {((event.eventType === 'promotional' || event.eventType === 'experience') && event.externalLink) ? (
                <>
                  <div className="glass rounded-xl p-4 sm:p-6 sticky top-24">
                    <h2 className="text-sm font-semibold text-white mb-4">Ticket Information</h2>
                    <div className="space-y-4">
                      {event.priceFrom && (
                        <div className="glass-light rounded-lg p-4 border-l-4 border-red-600">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1 font-medium">Price From</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-white">
                                {event.currency || 'KES'} {parseFloat(event.priceFrom).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <Button 
                        className="w-full bg-gradient-to-r bg-gradient-red hover:opacity-90 text-white red-glow text-sm sm:text-base py-4 sm:py-5 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-700/25"
                        onClick={() => window.open(event.externalLink, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="glass rounded-xl p-4 sm:p-6 sticky top-24">
                  <h2 className="text-sm font-semibold text-white mb-4 sm:mb-6">Select Tickets</h2>

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    {event.tickets.map((ticket) => {
                      const remainingTickets = Number(ticket.available) || 0;
                      const isSoldOut = ticket.status === 'Sold Out' || remainingTickets <= 0;
                      
                      return (
                        <div 
                          key={ticket.id} 
                          className={`glass-light rounded-lg p-3 sm:p-4 border-l-4 transition-all ${
                            isSoldOut 
                              ? 'border-zinc-700 opacity-60' 
                              : 'border-primary'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-semibold text-xs sm:text-sm truncate ${
                                  isSoldOut ? 'text-zinc-400' : 'text-white'
                                }`}>
                                  {ticket.name}
                                </h3>
                                {isSoldOut && (
                                  <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                                    SOLD OUT
                                  </Badge>
                                )}
                                {!isSoldOut && remainingTickets < 10 && (
                                  <Badge className="border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 hover:bg-amber-500/10">
                                    {remainingTickets} {remainingTickets === 1 ? 'ticket' : 'tickets'} remaining
                                  </Badge>
                                )}
                              </div>
                              {ticket.description && (
                                <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {ticket.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`text-xs sm:text-sm font-bold ${
                                isSoldOut ? 'text-zinc-400 line-through' : 'text-white'
                              }`}>
                                {parseFloat(ticket.price).toLocaleString()}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{event.currency || 'KES'}</p>
                            </div>
                          </div>

                          {!isSoldOut && (
                            <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/5">
                              <span className="text-[10px] sm:text-xs text-muted-foreground">Quantity</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                                  onClick={() => updateTicketQuantity(ticket.id, -1)}
                                  disabled={!selectedTickets[ticket.id]}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 sm:w-8 text-center font-semibold text-white text-sm sm:text-base">
                                  {selectedTickets[ticket.id] || 0}
                                </span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                                  onClick={() => updateTicketQuantity(ticket.id, 1)}
                                  disabled={(selectedTickets[ticket.id] || 0) >= remainingTickets}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Total */}
                  <div className="border-t border-white/5 pt-3 sm:pt-4 mb-4 sm:mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-semibold text-white">Total</span>
                      <span className="text-sm sm:text-base font-bold text-white">
                        {event.currency || 'KES'} {calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-[#DC143C] to-[#B01030] hover:from-[#B01030] hover:to-[#8B0A24] text-white text-sm sm:text-base py-4 sm:py-5 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#DC143C]/25"
                    onClick={handleCheckout}
                    disabled={totalTickets === 0}
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetailsPage;
