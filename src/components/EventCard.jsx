import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { EventImagePlaceholder } from './EventImagePlaceholder';
import { useState, useEffect } from 'react';

export const EventCard = ({ event, featured = false, isPast = false }) => {

  console.log('🃏 EventCard received:', {
    title: event.title,
    images: event.images,
    cover_image_index: event.cover_image_index,
    image: event.image,
    folder: event.folder,
    filename: event.filename
  })

  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 🆕 Reset image error when event changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [event.image, event.images, event.cover_image_index]);

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return 'TBA';
      }

      return date.toLocaleDateString('en-KE', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'TBA';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';

    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      return `${timeParts[0]}:${timeParts[1]}`;
    }

    return timeString;
  };

  const getTimeDisplay = () => {
    const startTime = formatTime(event.time || event.from_time);
    const endTime = formatTime(event.endTime || event.to_time);

    if (startTime && endTime) {
      return `${startTime} - ${endTime}`;
    } else if (startTime) {
      return startTime;
    }
    return 'Time TBA';
  };

  const getLowestPrice = () => {
    if (event.event_type === 'promotional' && event.price_from && parseFloat(event.price_from) > 0) {
      return parseFloat(event.price_from);
    }

    if (event.prices && Array.isArray(event.prices) && event.prices.length > 0) {
      const validPrices = event.prices
        .filter(p => p.price > 0)
        .map(p => parseFloat(p.price));

      if (validPrices.length > 0) {
        return Math.min(...validPrices);
      }
    }

    if (event.tickets && Array.isArray(event.tickets) && event.tickets.length > 0) {
      const validPrices = event.tickets
        .filter(t => t.price > 0 && (t.available === undefined || t.available > 0))
        .map(t => parseFloat(t.price));

      if (validPrices.length > 0) {
        return Math.min(...validPrices);
      }
    }

    if (event.price && parseFloat(event.price) > 0) {
      return parseFloat(event.price);
    }

    if (event.price_from && parseFloat(event.price_from) > 0) {
      return parseFloat(event.price_from);
    }

    if (event.priceRange && event.priceRange.min !== undefined && parseFloat(event.priceRange.min) > 0) {
      return parseFloat(event.priceRange.min);
    }

    return 0;
  };

  const lowestPrice = getLowestPrice();

  const isSoldOut = () => {
    if (event.tickets && Array.isArray(event.tickets) && event.tickets.length > 0) {
      return event.tickets.every(t => t.available === 0);
    }

    if (event.prices && Array.isArray(event.prices) && event.prices.length > 0) {
      return event.prices.every(p => p.available === 0);
    }

    return false;
  };

  const soldOut = isSoldOut();

  const getImageUrl = () => {
    // Direct image URL (most common for organizer API)
    if (event.image && event.image !== '/placeholder-event.jpg' && event.image !== 'null') {
      console.log('✅ Using direct image:', event.image);
      return event.image;
    }

    // images array
    if (event.images && Array.isArray(event.images) && event.images.length > 0) {
      const coverIndex = event.cover_image_index ?? 0
      const image = event.images[coverIndex]
      if (image) {
        console.log('✅ Using images array:', image);
        return image
      }
    }

    // poster_url
    if (event.poster_url) {
      console.log('✅ Using poster_url:', event.poster_url);
      return event.poster_url
    }

    console.log('❌ No image found for:', event.title);
    return null
  }

  const imageUrl = getImageUrl();
  console.log('🖼️ Final imageUrl:', {
    title: event.title,
    imageUrl: imageUrl,
    hasValidImage: imageUrl && !imageError,
    imageError: imageError
  });

  const hasValidImage = imageUrl && !imageError;

  // Get the event identifier (slug > uuid > id)
  const getEventIdentifier = () => {
    return event.slug || event.uuid || event.id;
  };

  return (
    <Link to={`/${getEventIdentifier()}`}>
      <div className="glass rounded-lg sm:rounded-xl overflow-hidden group smooth-transition hover:red-glow hover:-translate-y-1 flex flex-col h-full shadow-lg hover:shadow-2xl border border-white/5">
        {/* Image */}
        <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
          {hasValidImage ? (
            <>
              <img
                src={imageUrl}
                alt={event.title}
                className={`w-full h-full object-cover smooth-transition group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                onLoad={() => {
                  console.log('✅ Image loaded successfully:', imageUrl);
                  setImageLoaded(true);
                }}
                onError={() => {
                  console.log('❌ Image failed to load:', imageUrl);
                  setImageError(true);
                  setImageLoaded(false);
                }}
              />
              {!imageLoaded && (
                <EventImagePlaceholder
                  title={event.title}
                  category={event.category}
                  className="absolute inset-0"
                />
              )}
            </>
          ) : (
            <EventImagePlaceholder
              title={event.title}
              category={event.category}
              className="w-full h-full"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-2">
            {isPast && (
              <Badge variant="secondary" className="text-xs">
                ENDED
              </Badge>
            )}
            {!isPast && soldOut && (
              <Badge variant="destructive" className="text-xs">
                SOLD OUT
              </Badge>
            )}
          </div>

          {/* Date Badge */}
          <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 glass-light px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg">
            <p className="text-xs font-medium text-white">{formatDate(event.date || event.from)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-primary smooth-transition">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-muted-foreground/90 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
            {event.shortDescription || event.short_description || event.description || 'No description available'}
          </p>

          {/* Meta Info */}
          <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
            <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground/90">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="leading-tight">{getTimeDisplay()}</span>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground/90">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1 leading-tight">{event.venue || event.location || 'Venue TBA'}</span>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10 mt-auto">
            {!soldOut ? (
              <div>
                {lowestPrice > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="text-sm sm:text-base font-bold text-white">
                      {event.currency || 'KES'} {lowestPrice.toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="text-sm sm:text-base font-bold text-white">FREE</p>
                )}
              </div>
            ) : (
              <p className="text-sm sm:text-base font-bold text-destructive">Sold Out</p>
            )}

            <Button
              size="sm"
              variant={soldOut ? "outline" : "default"}
              className={`text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 h-7 sm:h-8 ${!soldOut ? "bg-gradient-red hover:opacity-90 text-white" : ""}`}
            >
              {soldOut ? 'View Details' : 'View Event'}
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};  