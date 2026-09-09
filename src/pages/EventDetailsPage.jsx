import { logClientError } from '../utils/errorLogger'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { EventImagePlaceholder } from '../components/EventImagePlaceholder'
import { OrganizerCard } from '../components/OrganizerCard'
import { ImageLightbox } from '../components/ImageLightbox'
import GoogleMapsEmbed from '../components/GoogleMapsEmbed'
import { eventApi } from '../services/eventApi'
import { API_BASE_URL } from '../services/apiClient'
import { checkoutApi } from '../services/checkoutApi'
import { pageViewApi } from '../services/pageViewApi'
import { transformEventDetails } from '../utils/eventTransformer'
import {
  Calendar,
  MapPin,
  Minus,
  Plus,
  Ticket,
  Loader2,
  Share2,
  Heart,
  Maximize2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  X,
  Mail,
  Twitter,
  Facebook,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Users,
  DollarSign,
  Eye,
  CalendarDays,
  Sparkles,
  Star,
  ArrowDown
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { toast } from 'sonner'

import { Helmet } from 'react-helmet-async'

const sanitizeDescriptionHtml = html => {
  if (!html) return html

  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u00AD\u200B\u200C\u200D\uFEFF]/g, '')
}

//   Helper to strip HTML tags for character count
const stripHtml = html => {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

const EventDetailsPage = () => {
  const { identifier } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTickets, setSelectedTickets] = useState({})
  const [timeLeft, setTimeLeft] = useState({})
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] =
    useState(false)
  const descriptionRef = useRef(null)
  const aboutRef = useRef(null) //   Ref for scrolling to about section

  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const cleanDescriptionHtml = useMemo(
    () => sanitizeDescriptionHtml(event?.description),
    [event?.description]
  )

  //   Get plain text version for character count
  const plainDescription = useMemo(
    () => stripHtml(event?.description || ''),
    [event?.description]
  )

  //   Truncated version for hero (100 chars)
  const truncatedDescription = useMemo(() => {
    if (!plainDescription) return ''
    if (plainDescription.length <= 10) return plainDescription
    return plainDescription.substring(0, 30) + '...'
  }, [plainDescription])

  //   Scroll to about section
  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // ========== LOAD EVENT ==========
  useEffect(() => {
    loadEvent()
  }, [identifier])

  // ========== AFFILIATE REFERRAL ==========
  useEffect(() => {
    const ref = searchParams.get('ref') || searchParams.get('affiliate')
    if (ref && identifier) {
      try {
        localStorage.setItem(
          'affiliate_ref',
          JSON.stringify({
            code: ref,
            event_id: identifier,
            timestamp: Date.now()
          })
        )
      } catch (error) {
        console.warn('Unable to persist affiliate referral:', error?.name)
      }

      fetch(`${API_BASE_URL}/track-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          ref,
          event_id: identifier,
          referrer_url: document.referrer || null
        })
      }).catch(() => {})
    }
  }, [identifier, searchParams])

  // ========== LOG EVENT DATA ==========
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
        shouldShowTickets: !(
          event.eventType === 'experience' &&
          !event.externalLink &&
          (!event.tickets || event.tickets.length === 0)
        )
      })
    }
  }, [event])

  // ========== DOCUMENT TITLE ==========
  useEffect(() => {
    if (!event) return
    document.title = `${event.title} - TurnApp`
    return () => {
      document.title = 'TurnApp - Discover Events'
    }
  }, [event])

  // ========== GET CURRENT IMAGE ==========
  const getCurrentImage = useCallback(() => {
    if (!event) return null

    if (
      event.images &&
      Array.isArray(event.images) &&
      event.images.length > 0
    ) {
      const image = event.images[currentImageIndex]
      if (image) {
        if (image.startsWith('http://') || image.startsWith('https://')) {
          return image
        }
        const baseUrl = (
          import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
        )
          .replace(/\/api$/, '')
          .replace(/\/api\/$/, '')
        return `${baseUrl}/storage/${image}`
      }
    }

    if (event.image) {
      if (
        event.image.startsWith('http://') ||
        event.image.startsWith('https://')
      ) {
        return event.image
      }
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')
        .replace(/\/api$/, '')
        .replace(/\/api\/$/, '')
      return `${baseUrl}/storage/${event.image}`
    }

    return null
  }, [event, currentImageIndex])

  const coverImage = getCurrentImage()

  // ========== LOAD EVENT FUNCTION ==========
  const loadEvent = async () => {
    setLoading(true)
    try {
      const response = await eventApi.getEvent(identifier)

      if (response.success) {
        const transformedEvent = transformEventDetails(response.data)

        const coverIndex = transformedEvent.cover_image_index ?? 0
        setCurrentImageIndex(coverIndex)

        setEvent(transformedEvent)
        pageViewApi.recordView(identifier)
      } else {
        toast.error('Event not found')
        navigate('/')
      }
    } catch (error) {
      console.error('Error loading event:', error)
      logClientError({ eventId: identifier, error })
      toast.error('Failed to load event details')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  // ========== COUNTDOWN TIMER ==========
  useEffect(() => {
    if (!event) return

    const calculateTimeLeft = () => {
      const eventDate = new Date(event.date + 'T' + event.time)
      const now = new Date()
      const difference = eventDate - now

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        }
      }
      return {}
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [event])

  // ========== DESCRIPTION OVERFLOW ==========
  const checkDescriptionOverflow = useCallback(() => {
    if (descriptionRef.current) {
      const el = descriptionRef.current
      setIsDescriptionOverflowing(el.scrollHeight > el.clientHeight + 4)
    }
  }, [])

  useEffect(() => {
    if (cleanDescriptionHtml) {
      const timer = setTimeout(checkDescriptionOverflow, 100)
      window.addEventListener('resize', checkDescriptionOverflow)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', checkDescriptionOverflow)
      }
    }
  }, [cleanDescriptionHtml, checkDescriptionOverflow])

  // ========== TICKET STATUS ==========
  const getTicketStatus = ticket => {
    if (ticket.sales_status === 'closed') {
      return {
        label: 'Sales Closed',
        color: 'text-red-400',
        badge: 'bg-red-500/10 border-red-500/30',
        isAvailable: false,
        reason: 'closed'
      }
    }

    if (ticket.sale_starts_at && new Date(ticket.sale_starts_at) > new Date()) {
      const startDate = new Date(ticket.sale_starts_at).toLocaleDateString(
        'en-KE',
        {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }
      )
      const startTime = new Date(ticket.sale_starts_at).toLocaleTimeString(
        'en-KE',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      )
      return {
        label: `Coming Soon (${startDate} ${startTime})`,
        color: 'text-amber-400',
        badge: 'bg-amber-500/10 border-amber-500/30',
        isAvailable: false,
        reason: 'not_started'
      }
    }

    if (ticket.sale_ends_at && new Date(ticket.sale_ends_at) < new Date()) {
      return {
        label: 'Sales Ended',
        color: 'text-red-400',
        badge: 'bg-red-500/10 border-red-500/30',
        isAvailable: false,
        reason: 'ended'
      }
    }

    if (ticket.available <= 0) {
      return {
        label: 'Sold Out',
        color: 'text-red-400',
        badge: 'bg-red-500/10 border-red-500/30',
        isAvailable: false,
        reason: 'sold_out'
      }
    }

    return {
      label: 'Available',
      color: 'text-emerald-400',
      badge: 'bg-emerald-500/10 border-emerald-500/30',
      isAvailable: true,
      reason: 'available'
    }
  }

  // ========== TICKET QUANTITY ==========
  const updateTicketQuantity = (ticketId, change) => {
    setSelectedTickets(prev => {
      const currentQty = prev[ticketId] || 0
      const newQty = Math.max(0, currentQty + change)

      if (newQty === 0) {
        const { [ticketId]: removed, ...rest } = prev
        return rest
      }

      return { ...prev, [ticketId]: newQty }
    })
  }

  const calculateTotal = () => {
    return Object.entries(selectedTickets).reduce(
      (total, [ticketId, quantity]) => {
        const ticket = event.tickets.find(t => t.id === ticketId)
        return total + (ticket ? ticket.price * quantity : 0)
      },
      0
    )
  }

  // ========== CHECKOUT ==========
  const handleCheckout = async () => {
    const selectedTicketsList = Object.entries(selectedTickets)
      .map(([ticketId, quantity]) => {
        const ticket = event.tickets.find(t => t.id === ticketId)
        return ticket ? { ...ticket, quantity } : null
      })
      .filter(Boolean)

    if (selectedTicketsList.length === 0) {
      toast.error('Please select at least one ticket')
      return
    }

    try {
      const validation = await checkoutApi.validateCart()
      if (!validation.success) {
        toast.error(validation.message || 'Cart validation failed')
        return
      }
    } catch (error) {
      console.error('Cart validation error:', error)
      toast.error('Failed to validate cart')
      return
    }

    navigate('/checkout', {
      state: {
        event,
        selectedTickets: selectedTicketsList,
        total: calculateTotal()
      }
    })
  }

  // ========== SHARE FUNCTIONS ==========
  const getShareUrl = () => {
    const shareIdentifier = event?.slug || event?.uuid || event?.id
    return `${window.location.origin}/${shareIdentifier}`
  }

  const getShareText = () => {
    const cleanDescription = (
      event?.shortDescription ||
      event?.description?.replace(/<[^>]*>/g, '').substring(0, 150) ||
      'Check out this amazing event on TurnApp!'
    ).trim()

    return `${event?.title}\n\n${cleanDescription}\n\nLocation: ${
      event?.venue || ''
    }\nDate: ${new Date(event?.date).toLocaleDateString('en-KE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}${
      event?.time ? ` at ${event.time.substring(0, 5)}` : ''
    }\n\nGet your tickets at:`
  }

  const handleCopyLink = async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to copy link')
    }
  }

  const shareToPlatform = platform => {
    const url = getShareUrl()
    const text = getShareText()
    const encodedText = encodeURIComponent(text)
    const encodedUrl = encodeURIComponent(url)

    let shareUrl = ''

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%0A${encodedUrl}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(
          `${event?.title} - TurnApp`
        )}&body=${encodedText}%0A${encodedUrl}`
        break
      default:
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=600')
    }
  }

  const toggleShareModal = () => {
    setShareModalOpen(!shareModalOpen)
    setCopied(false)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event?.title,
          text: getShareText(),
          url: getShareUrl()
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            console.error('Error sharing:', error)
            toggleShareModal()
          }
        })
    } else {
      toggleShareModal()
    }
  }

  // ========== SAVE TO CALENDAR ==========
  const handleSaveToCalendar = () => {
    if (!event) return

    try {
      const eventDate = new Date(event.date + 'T' + event.time)
      const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000)

      const formatCalendarDate = date => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      }

      const startTime = formatCalendarDate(eventDate)
      const endTime = formatCalendarDate(endDate)

      const description =
        event.shortDescription ||
        event.description.replace(/<[^>]*>/g, '').substring(0, 200)

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.title
      )}&dates=${startTime}/${endTime}&details=${encodeURIComponent(
        description
      )}&location=${encodeURIComponent(event.venue)}&sf=true&output=xml`

      window.open(googleCalendarUrl, '_blank')
      setIsFavorite(!isFavorite)

      if (!isFavorite) {
        toast.success('Event saved to calendar!')
      } else {
        toast.info('Opening calendar...')
      }
    } catch (error) {
      console.error('Error saving to calendar:', error)
      toast.error('Failed to save to calendar. Please try again.')
    }
  }

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto mb-4' />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-white mb-4'>
            Event not found
          </h1>
          <Button onClick={() => navigate('/')}>Back to Events</Button>
        </div>
      </div>
    )
  }

  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0)

  return (
    <>
      <Helmet>
        <title>{event?.title} - TurnApp</title>
        <meta property='og:title' content={`${event?.title} - TurnApp`} />
        <meta
          property='og:description'
          content={
            event?.shortDescription ||
            event?.description?.replace(/<[^>]*>/g, '').substring(0, 150) ||
            'Check out this amazing event on TurnApp!'
          }
        />
        <meta
          property='og:image'
          content={coverImage || 'https://turnapp.events/og-image.jpg'}
        />
        <meta property='og:url' content={getShareUrl()} />
        <meta property='og:type' content='article' />
        <meta property='og:site_name' content='TurnApp' />
        <meta property='og:locale' content='en_KE' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={`${event?.title} - TurnApp`} />
        <meta
          name='twitter:description'
          content={
            event?.shortDescription ||
            event?.description?.replace(/<[^>]*>/g, '').substring(0, 150) ||
            'Check out this amazing event on TurnApp!'
          }
        />
        <meta
          name='twitter:image'
          content={coverImage || 'https://turnapp.events/og-image.jpg'}
        />
        <meta
          name='description'
          content={
            event?.shortDescription ||
            event?.description?.replace(/<[^>]*>/g, '').substring(0, 160) ||
            'Check out this amazing event on TurnApp!'
          }
        />
        <link rel='canonical' href={getShareUrl()} />
        <script type='application/ld+json'>
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: event?.title,
            description:
              event?.shortDescription ||
              event?.description?.replace(/<[^>]*>/g, '').substring(0, 200),
            startDate: event?.date,
            endDate: event?.endDate,
            location: {
              '@type': 'Place',
              name: event?.venue,
              address: event?.location
            },
            image: coverImage,
            url: getShareUrl(),
            offers: {
              '@type': 'Offer',
              price: event?.priceFrom || '0',
              priceCurrency: event?.currency || 'KES',
              availability: 'https://schema.org/InStock'
            }
          })}
        </script>
      </Helmet>

      <div className='min-h-screen overflow-x-hidden'>
        <Navbar />

        <ImageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          imageUrl={
            event.images && event.images.length > 0
              ? event.images[currentImageIndex]
              : event.image
          }
          title={event.title}
        />

        {/* ========== HERO SECTION ========== */}
        {/* ========== HERO SECTION ========== */}
        <div className='relative mt-16'>
          {/* Blurry Background Layer */}
          <div className='absolute inset-0 z-0'>
            {coverImage ? (
              <>
                <img
                  src={coverImage}
                  alt=''
                  className='w-full h-full object-cover opacity-30 blur-3xl scale-110'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent' />
              </>
            ) : (
              <div className='w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950' />
            )}
          </div>

          {/* Main Content */}
          <div className='relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12'>
            <div className='flex flex-col lg:flex-row gap-6 md:gap-8 items-center lg:items-end'>
              {/* Image Carousel - Full width on mobile */}
              <div className='w-full lg:w-[420px] xl:w-[480px] flex-shrink-0'>
                <div className='relative group rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl'>
                  {/* Main Image */}
                  <div className='aspect-[16/10] sm:aspect-[4/3] bg-zinc-900'>
                    {coverImage && !imageError ? (
                      <img
                        src={coverImage}
                        alt={event.title}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${
                          imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => {
                          setImageError(true)
                          setImageLoaded(false)
                        }}
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center bg-zinc-800/50'>
                        <EventImagePlaceholder
                          title={event.title}
                          category={event.category}
                        />
                      </div>
                    )}
                  </div>

                  {/* Image Navigation Controls */}
                  {event.images && event.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentImageIndex(prev =>
                            prev > 0 ? prev - 1 : event.images.length - 1
                          )
                        }
                        className='absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/20 hover:scale-110 shadow-lg'
                      >
                        <ChevronLeft className='h-4 w-4 sm:h-5 sm:w-5' />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentImageIndex(prev =>
                            prev < event.images.length - 1 ? prev + 1 : 0
                          )
                        }
                        className='absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/20 hover:scale-110 shadow-lg'
                      >
                        <ChevronRight className='h-4 w-4 sm:h-5 sm:w-5' />
                      </button>

                      {/* Dots */}
                      <div className='absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10'>
                        {event.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`transition-all rounded-full ${
                              index === currentImageIndex
                                ? 'bg-white w-4 sm:w-6 h-1 sm:h-1.5'
                                : 'bg-white/40 hover:bg-white/60 w-1.5 h-1.5'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Fullscreen Button */}
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className='absolute top-2 sm:top-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/20 hover:scale-110 shadow-lg'
                  >
                    <Maximize2 className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                  </button>
                </div>
              </div>

              {/* Content - Full width on mobile */}

              {/* Content - Full width on mobile */}
              <div className='flex-1 min-w-0 space-y-3 sm:space-y-4 w-full'>
                {/* Badges */}
                <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
                  {event.featured && (
                    <span className='px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1'>
                      <Star className='h-2.5 w-2.5 sm:h-3 sm:w-3 fill-yellow-400' />
                      FEATURED
                    </span>
                  )}
                  <span className='px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-white/5 text-zinc-300 border border-white/10'>
                    {event.category?.toUpperCase() || 'EVENT'}
                  </span>
                  <span className='px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1'>
                    <span className='w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 animate-pulse' />
                    {event.status || 'Ongoing'}
                  </span>
                </div>

                {/* Title */}
                <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight leading-tight break-words'>
                  {event.title}
                </h1>

                {/* Short Description - NO HYPHENATION */}
                {/* {plainDescription && (
    <div className='max-w-2xl'>
      <p className='text-sm sm:text-base text-zinc-400 break-words overflow-wrap-anywhere'>
        {truncatedDescription}
        {plainDescription.length > 100 && (
          <button
            onClick={scrollToAbout}
            className='ml-1 sm:ml-2 text-primary hover:text-primary/80 inline-flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap'
          >
            Read More
            <ArrowDown className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
          </button>
        )}
      </p>
    </div>
  )} */}

                {/* Short Description - NO HYPHENATION */}

                {/* {plainDescription && (
  <div className='max-w-2xl min-w-0 w-full'>
    <p className='text-sm sm:text-base text-zinc-400 break-normal'>
      {truncatedDescription}
      {plainDescription.length > 10 && (
        <button
          onClick={scrollToAbout}
          className='ml-1 sm:ml-2 text-primary hover:text-primary/80 inline-flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap'
        >
          Read More
          <ArrowDown className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
        </button>
      )}
    </p>
  </div>
)} */}

                {/* Event Details - Responsive */}
                <div className='flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 sm:gap-y-2 pt-1 sm:pt-2'>
                  <div className='flex items-center gap-1.5 sm:gap-2 text-white'>
                    <Calendar className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0' />
                    <span className='text-xs sm:text-sm font-medium whitespace-nowrap'>
                      {new Date(event.date).toLocaleDateString('en-KE', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {event.endDate && event.endDate !== event.date && (
                        <>
                          {' '}
                          -{' '}
                          {new Date(event.endDate).toLocaleDateString('en-KE', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </>
                      )}
                    </span>
                  </div>

                  <span className='text-zinc-600 hidden xs:inline'>|</span>

                  <div className='flex items-center gap-1.5 sm:gap-2 text-white'>
                    <Clock className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0' />
                    <span className='text-xs sm:text-sm font-medium whitespace-nowrap'>
                      {event.time?.substring(0, 5)}
                      {event.endTime
                        ? ` - ${event.endTime.substring(0, 5)}`
                        : ''}
                    </span>
                  </div>

                  <span className='text-zinc-600 hidden xs:inline'>|</span>

                  <div className='flex items-center gap-1.5 sm:gap-2 text-white min-w-0'>
                    <MapPin className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0' />
                    <span className='text-xs sm:text-sm font-medium truncate max-w-[120px] xs:max-w-[180px] md:max-w-[250px]'>
                      {event.venue || event.location}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2'>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={handleSaveToCalendar}
                    className={`h-8 w-8 sm:h-9 sm:w-9 border-white/10 hover:bg-white/10 ${
                      isFavorite
                        ? 'text-red-500 border-red-500/30'
                        : 'text-white'
                    }`}
                    title='Save to calendar'
                  >
                    <Heart
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isFavorite ? 'fill-current' : ''
                      }`}
                    />
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={handleShare}
                    className='h-8 w-8 sm:h-9 sm:w-9 border-white/10 text-white hover:bg-white/10'
                    title='Share event'
                  >
                    <Share2 className='h-4 w-4 sm:h-5 sm:w-5' />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== MAIN CONTENT ========== */}
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 pb-16 overflow-x-hidden'>
          {/* Countdown Timer */}
          {Object.keys(timeLeft).length > 0 && (
            <div className='bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-6 mb-8'>
              <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
                <Clock className='h-4 w-4 text-primary' />
                Event Starts In
              </h3>
              <div className='grid grid-cols-4 gap-3 max-w-md'>
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className='text-center'>
                    <div className='bg-primary/10 border border-primary/20 rounded-lg p-3'>
                      <p className='text-2xl md:text-3xl font-bold text-white'>
                        {value}
                      </p>
                    </div>
                    <p className='text-xs text-zinc-500 uppercase mt-1'>
                      {unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
            {/* Left Column - Event Details */}
            <div className='lg:col-span-7 space-y-6'>
              {/* About Section - with ref for scrolling */}
              <div
                ref={aboutRef}
                className='bg-zinc-900/30 border border-white/5 rounded-xl p-6 scroll-mt-20'
              >
                <h2 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
                  <Sparkles className='h-5 w-5 text-primary' />
                  About This Event
                </h2>
                <div className='relative'>
                  <div
                    ref={descriptionRef}
                    className={`prose prose-invert prose-zinc max-w-none text-zinc-300 text-sm leading-relaxed transition-[max-height] duration-300 ease-in-out overflow-hidden ${
                      showFullDescription ? 'max-h-[none]' : 'max-h-[9rem]'
                    }`}
                    style={{
                      maxHeight: showFullDescription
                        ? `${descriptionRef.current?.scrollHeight || 9999}px`
                        : '9rem'
                    }}
                    dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml }}
                  />

                  {!showFullDescription && isDescriptionOverflowing && (
                    <div className='absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-900/80 to-transparent pointer-events-none' />
                  )}
                  {isDescriptionOverflowing && (
                    <button
                      onClick={() => setShowFullDescription(prev => !prev)}
                      className='mt-3 text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors'
                    >
                      {showFullDescription ? (
                        <>
                          Read Less
                          <ChevronUp className='h-4 w-4' />
                        </>
                      ) : (
                        <>
                          Read More
                          <ChevronDown className='h-4 w-4' />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Highlights */}
              {event.highlights && event.highlights.length > 0 && (
                <div className='bg-zinc-900/30 border border-white/5 rounded-xl p-6'>
                  <h2 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
                    <Star className='h-5 w-5 text-yellow-500' />
                    Highlights
                  </h2>
                  <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {event.highlights.map((highlight, index) => (
                      <li
                        key={index}
                        className='flex items-center gap-2 text-sm text-zinc-300'
                      >
                        <span className='w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0' />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lineup */}
              {event.lineup && event.lineup.length > 0 && (
                <div className='bg-zinc-900/30 border border-white/5 rounded-xl p-6'>
                  <h2 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
                    <Users className='h-5 w-5 text-blue-400' />
                    Lineup
                  </h2>
                  <div className='flex flex-wrap gap-2'>
                    {event.lineup.map((artist, index) => (
                      <Badge
                        key={index}
                        variant='outline'
                        className='border-white/10 text-zinc-300 px-4 py-2'
                      >
                        {artist}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizer (Mobile) */}
              {event.organizer && event.userId && (
                <div className='lg:hidden'>
                  <OrganizerCard
                    organizer={event.organizer}
                    userId={event.userId}
                  />
                </div>
              )}

              {/* Google Maps */}
              {(event.latitude && event.longitude) ||
              event.googleMapsLocation ? (
                <GoogleMapsEmbed
                  latitude={event.latitude}
                  longitude={event.longitude}
                  venue={event.venue}
                  googleMapsLocation={event.googleMapsLocation}
                  hideViewOnMaps={true}
                />
              ) : null}
            </div>

            {/* Right Column - Tickets & Sidebar */}
            <div className='lg:col-span-5 space-y-6'>
              {/* Organizer (Desktop) */}
              {event.organizer && event.userId && (
                <div className='hidden lg:block'>
                  <OrganizerCard
                    organizer={event.organizer}
                    userId={event.userId}
                  />
                </div>
              )}

              {/* Ticket Section */}
              {event.eventType === 'promotional' && event.externalLink ? (
                <div className='bg-zinc-900/50 border border-white/5 rounded-xl p-6 sticky top-24'>
                  <h2 className='text-lg font-bold text-white mb-4'>
                    Get Tickets
                  </h2>
                  {event.priceFrom && (
                    <div className='bg-zinc-800/50 rounded-lg p-4 mb-4 border-l-4 border-primary'>
                      <p className='text-sm text-zinc-400'>Starting from</p>
                      <p className='text-2xl font-bold text-white'>
                        {event.currency || 'KES'}{' '}
                        {parseFloat(event.priceFrom).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <Button
                    className='w-full bg-primary hover:bg-primary/90 text-white py-6 text-base'
                    onClick={() => window.open(event.externalLink, '_blank')}
                  >
                    <ExternalLink className='h-5 w-5 mr-2' />
                    Book Now
                  </Button>
                </div>
              ) : (
                <div className='bg-zinc-900/50 border border-white/5 rounded-xl p-6 sticky top-24'>
                  <h2 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
                    <Ticket className='h-5 w-5 text-primary' />
                    Select Tickets
                  </h2>

                  <div className='space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar'>
                    {event.tickets.map(ticket => {
                      const status = getTicketStatus(ticket)
                      const isSoldOut = ticket.available === 0
                      const isUnavailable = !status.isAvailable

                      return (
                        <div
                          key={ticket.id}
                          className={`bg-zinc-800/50 rounded-lg p-4 transition-all ${
                            isUnavailable
                              ? 'opacity-60'
                              : 'border-l-4 border-primary'
                          }`}
                        >
                          <div className='flex justify-between items-start mb-2'>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 flex-wrap'>
                                <h3
                                  className={`font-semibold ${
                                    isUnavailable
                                      ? 'text-zinc-400'
                                      : 'text-white'
                                  }`}
                                >
                                  {ticket.name}
                                </h3>
                                <Badge
                                  className={`${status.badge} ${status.color}`}
                                >
                                  {status.label}
                                </Badge>
                              </div>
                              {ticket.description && (
                                <p className='text-xs text-zinc-400 mt-1'>
                                  {ticket.description}
                                </p>
                              )}
                              {!isUnavailable &&
                                ticket.available <= 10 &&
                                ticket.available > 0 && (
                                  <p className='text-xs text-amber-500 mt-1'>
                                    Only {ticket.available} left!
                                  </p>
                                )}
                              {ticket.sale_starts_at && (
                                <p className='text-xs text-zinc-500 mt-1'>
                                  Sale starts:{' '}
                                  {new Date(
                                    ticket.sale_starts_at
                                  ).toLocaleDateString()}
                                </p>
                              )}
                              {ticket.sale_ends_at && (
                                <p className='text-xs text-zinc-500'>
                                  Sale ends:{' '}
                                  {new Date(
                                    ticket.sale_ends_at
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className='text-right flex-shrink-0 ml-4'>
                              {ticket.type === 'free' ||
                              ticket.type === 'complimentary' ? (
                                <span className='text-lg font-bold text-emerald-400'>
                                  FREE
                                </span>
                              ) : (
                                <span
                                  className={`text-lg font-bold ${
                                    isUnavailable
                                      ? 'text-zinc-400'
                                      : 'text-white'
                                  }`}
                                >
                                  {event.currency || 'KES'}{' '}
                                  {parseFloat(ticket.price).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {status.isAvailable && !isSoldOut && (
                            <div className='flex items-center justify-between mt-3 pt-3 border-t border-white/5'>
                              <span className='text-xs text-zinc-500'>
                                Quantity
                              </span>
                              <div className='flex items-center gap-3'>
                                <Button
                                  size='icon'
                                  variant='outline'
                                  className='h-8 w-8 rounded-full border-white/10 hover:bg-white/10'
                                  onClick={() =>
                                    updateTicketQuantity(ticket.id, -1)
                                  }
                                  disabled={!selectedTickets[ticket.id]}
                                >
                                  <Minus className='h-3 w-3' />
                                </Button>
                                <span className='w-8 text-center font-semibold text-white'>
                                  {selectedTickets[ticket.id] || 0}
                                </span>
                                <Button
                                  size='icon'
                                  variant='outline'
                                  className='h-8 w-8 rounded-full border-white/10 hover:bg-white/10'
                                  onClick={() =>
                                    updateTicketQuantity(ticket.id, 1)
                                  }
                                  disabled={
                                    (selectedTickets[ticket.id] || 0) >=
                                    ticket.available
                                  }
                                >
                                  <Plus className='h-3 w-3' />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className='border-t border-white/10 pt-4 mt-4'>
                    <div className='flex justify-between items-center mb-4'>
                      <span className='text-sm font-semibold text-white'>
                        Total
                      </span>
                      <span className='text-xl font-bold text-white'>
                        {event.currency || 'KES'}{' '}
                        {calculateTotal().toLocaleString()}
                      </span>
                    </div>
                    <Button
                      className='w-full bg-primary hover:bg-primary/90 text-white py-6 text-base'
                      onClick={handleCheckout}
                      disabled={totalTickets === 0}
                    >
                      <Ticket className='h-5 w-5 mr-2' />
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SHARE MODAL */}
        {shareModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200'>
            <div className='relative bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200'>
              <button
                onClick={() => setShareModalOpen(false)}
                className='absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors'
              >
                <X className='h-5 w-5' />
              </button>

              <h2 className='text-xl font-bold text-white mb-2'>Share Event</h2>
              <p className='text-sm text-zinc-400 mb-6'>
                Share "{event?.title}" with your friends
              </p>

              <div className='flex items-center gap-2 bg-zinc-800 rounded-xl p-2 mb-6'>
                <input
                  type='text'
                  value={getShareUrl()}
                  readOnly
                  className='flex-1 bg-transparent text-white text-sm px-3 py-2 focus:outline-none'
                />
                <Button
                  onClick={handleCopyLink}
                  className='flex-shrink-0 bg-primary hover:bg-primary/90 text-white px-4'
                >
                  {copied ? (
                    <>
                      <Check className='h-4 w-4 mr-1' />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className='h-4 w-4 mr-1' />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>

              <div className='relative mb-6'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t border-white/10' />
                </div>
                <div className='relative flex justify-center text-xs'>
                  <span className='bg-zinc-900 px-2 text-zinc-500'>OR</span>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <Button
                  onClick={() => shareToPlatform('whatsapp')}
                  className='bg-[#25D366] hover:bg-[#1DA851] text-white'
                >
                  <MessageCircle className='h-4 w-4 mr-2' />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => shareToPlatform('facebook')}
                  className='bg-[#1877F2] hover:bg-[#166FE5] text-white'
                >
                  <Facebook className='h-4 w-4 mr-2' />
                  Facebook
                </Button>
                <Button
                  onClick={() => shareToPlatform('twitter')}
                  className='bg-[#000000] hover:bg-[#1a1a1a] text-white border border-white/10'
                >
                  <Twitter className='h-4 w-4 mr-2' />
                  Twitter / X
                </Button>
                <Button
                  onClick={() => shareToPlatform('email')}
                  className='bg-zinc-700 hover:bg-zinc-600 text-white'
                >
                  <Mail className='h-4 w-4 mr-2' />
                  Email
                </Button>
              </div>

              {navigator.share && (
                <div className='mt-4'>
                  <Button
                    onClick={() => {
                      setShareModalOpen(false)
                      navigator
                        .share({
                          title: event?.title,
                          text: getShareText(),
                          url: getShareUrl()
                        })
                        .catch(() => {})
                    }}
                    variant='outline'
                    className='w-full border-white/10 hover:bg-white/5 text-white'
                  >
                    <Share2 className='h-4 w-4 mr-2' />
                    More Options
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}

export default EventDetailsPage
