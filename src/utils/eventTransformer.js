// /**
//  * Transform API event data to match the frontend component structure
//  */

// /**
//  * Transform event list item from API
//  * @param {Object} apiEvent - Event data from API
//  * @param {boolean} isExperience - Whether this is from the experiences endpoint
//  * @returns {Object} Transformed event object
//  */
// // export const transformEventListItem = (apiEvent, isExperience = false) => {
// //   // For promotional events, use price_from; otherwise use price_range.min
// //   const getPrice = () => {
// //     console.log('event type tranformer ->', apiEvent.event_type)
// //     if (apiEvent.event_type === 'promotional' && apiEvent.price_from) {
// //       return parseFloat(apiEvent.price_from)
// //     }
// //     return apiEvent.price_range?.min || 0
// //   }

// //   return {
// //     id: apiEvent.id,
// //     uuid: apiEvent.uuid,
// //     slug: apiEvent.slug,
// //     cover_image_index: apiEvent.cover_image_index ?? 0, // 🆕 ADD THI
// //     title: apiEvent.title,
// //     description: apiEvent.short_description || '',
// //     shortDescription: apiEvent.short_description || '',
// //     date: apiEvent.from,
// //     time: apiEvent.from_time,
// //     endTime: apiEvent.to_time,
// //     venue: apiEvent.location,
// //     location: apiEvent.location,
// //     image: apiEvent.poster_url || '/placeholder-event.jpg',
// //     category: apiEvent.category?.name?.toLowerCase() || 'general',
// //     featured: false, // Will be set by featured endpoint
// //     price: getPrice(),
// //     priceRange: apiEvent.price_range,
// //     // Include event_type and price_from for EventCard component
// //     event_type: isExperience ? 'promotional' : apiEvent.event_type,
// //     price_from: apiEvent.price_from,
// //     external_link: apiEvent.external_link,
// //     currency: apiEvent.currency,
// //     isExperience: isExperience,
// //     // Add empty tickets array for list items (they don't have ticket details)
// //     tickets: []
// //   }
// // }



























// export const transformEventListItem = (apiEvent, isExperience = false) => {
//   // 🔍 DEBUG: Log the raw API event data
//   console.log('📥 transformEventListItem - raw apiEvent:', {
//     title: apiEvent.title,
//     images: apiEvent.images,
//     cover_image_index: apiEvent.cover_image_index,
//     poster_url: apiEvent.poster_url,
//     folder: apiEvent.folder,
//     filename: apiEvent.filename
//   })

//   // For promotional events, use price_from; otherwise use price_range.min
//   const getPrice = () => {
//     console.log('event type tranformer ->', apiEvent.event_type)
//     if (apiEvent.event_type === 'promotional' && apiEvent.price_from) {
//       return parseFloat(apiEvent.price_from)
//     }
//     return apiEvent.price_range?.min || 0
//   }

//   const transformed = {
//     id: apiEvent.id,
//     uuid: apiEvent.uuid,
//     slug: apiEvent.slug,
//     cover_image_index: apiEvent.cover_image_index ?? 0,
//     title: apiEvent.title,
//     description: apiEvent.short_description || '',
//     shortDescription: apiEvent.short_description || '',
//     date: apiEvent.from,
//     time: apiEvent.from_time,
//     endTime: apiEvent.to_time,
//     venue: apiEvent.location,
//     location: apiEvent.location,
//     image: apiEvent.poster_url || '/placeholder-event.jpg',
//     images: apiEvent.images || [],  // 🆕 ADD THIS
//     folder: apiEvent.folder,          // 🆕 ADD THIS
//     filename: apiEvent.filename,      // 🆕 ADD THIS
//     category: apiEvent.category?.name?.toLowerCase() || 'general',
//     featured: false,
//     price: getPrice(),
//     priceRange: apiEvent.price_range,
//     event_type: isExperience ? 'promotional' : apiEvent.event_type,
//     price_from: apiEvent.price_from,
//     external_link: apiEvent.external_link,
//     currency: apiEvent.currency,
//     isExperience: isExperience,
//     tickets: []
//   }

//   // 🔍 DEBUG: Log the transformed output
//   console.log('📤 transformEventListItem - transformed:', {
//     title: transformed.title,
//     images: transformed.images,
//     cover_image_index: transformed.cover_image_index,
//     image: transformed.image
//   })

//   return transformed
// }



// /**
//  * Transform detailed event data from API
//  * @param {Object} apiEvent - Detailed event data from API
//  * @returns {Object} Transformed event object
//  */
// export const transformEventDetails = apiEvent => {
//   // Parse highlights and lineup if they are JSON strings
//   const parseJsonField = field => {
//     if (!field) return []
//     if (Array.isArray(field)) return field
//     if (typeof field === 'string') {
//       try {
//         const parsed = JSON.parse(field)
//         return Array.isArray(parsed) ? parsed : []
//       } catch (e) {
//         return []
//       }
//     }
//     return []
//   }

//   // console.log("api event ->", apiEvent)

//   console.log(
//     'expected event type ->',
//     (apiEvent.type === 'event' ? apiEvent.event_type : apiEvent.type) ||
//       'ticketed'
//   )

//   return {
//     id: apiEvent.id,
//     uuid: apiEvent.uuid,
//     slug: apiEvent.slug,
//     cover_image_index: apiEvent.cover_image_index ?? 0, 
//     title: apiEvent.title,
//     description: apiEvent.description || apiEvent.short_description || '',
//     shortDescription: apiEvent.short_description || '',
//     date: apiEvent.from,
//     endDate: apiEvent.to,
//     time: apiEvent.from_time,
//     endTime: apiEvent.to_time,
//     venue: apiEvent.location,
//     location: apiEvent.location,
//     googleMapsLocation: apiEvent.google_maps_location,
//     latitude: apiEvent.latitude,
//     longitude: apiEvent.longitude,
//     eventType:
//       (apiEvent.type === 'event' ? apiEvent.event_type : apiEvent.type) ||
//       'ticketed',
//     externalLink: apiEvent.external_link,
//     image:
//       apiEvent.poster_url ||
//       (apiEvent.images && apiEvent.images.length > 0
//         ? apiEvent.images[0]
//         : '/placeholder-event.jpg'),
//     images:
//       apiEvent.images || (apiEvent.poster_url ? [apiEvent.poster_url] : []),
//     currency: apiEvent.currency || 'KES',
//     priceFrom: apiEvent.price_from,
//     category: apiEvent.category?.name?.toLowerCase() || 'general',
//     featured: false,
//     highlights: parseJsonField(apiEvent.event_highlights),
//     lineup: parseJsonField(apiEvent.lineup),
//     userId: apiEvent.user_id,
//     organizer: apiEvent.user
//       ? {
//           name: apiEvent.user.name,
//           email: apiEvent.user.email,
//           profile_photo_url: apiEvent.user.profile_photo_url,
//           bio: apiEvent.user.bio,
//           social_links: apiEvent.user.social_links
//         }
//       : {
//           name: apiEvent.owner,
//           email: apiEvent.email,
//           phone: apiEvent.phone
//         },
//     tickets: (apiEvent.tickets || []).map(transformTicket)
//   }
// }

// /**
//  * Transform ticket data from API
//  * @param {Object} apiTicket - Ticket data from API
//  * @returns {Object} Transformed ticket object
//  */
// export const transformTicket = apiTicket => {
//   return {
//     id: apiTicket.id.toString(),
//     name: apiTicket.name,
//     description: apiTicket.description || '',
//     price: parseFloat(apiTicket.price) || 0,
//     available: parseInt(apiTicket.available) || 0,
//     total: parseInt(apiTicket.total) || 0,
//     ticketType: apiTicket.ticket_type,
//     groupSize: apiTicket.group_size,
//     status: apiTicket.status,

//     // 🆕 Sale Controls
//     sales_status: apiTicket.sales_status || 'open',
//     sale_starts_at: apiTicket.sale_starts_at || null,
//     sale_ends_at: apiTicket.sale_ends_at || null,
//     is_available: apiTicket.is_available ?? true,
//     sale_status_label: apiTicket.sale_status_label || 'Available',
//   }
// }

// /**
//  * Transform multiple events from API
//  * @param {Array|Object} apiEvents - Array of events from API or object with items property
//  * @param {boolean} isFeatured - Whether these are featured events
//  * @param {boolean} isExperience - Whether these are from the experiences endpoint
//  * @returns {Array} Array of transformed events
//  */
// export const transformEventList = (
//   apiEvents,
//   isFeatured = false,
//   isExperience = false
// ) => {
//   // Handle cases where apiEvents is an object with items property
//   let eventsArray = apiEvents
//   if (apiEvents && typeof apiEvents === 'object' && !Array.isArray(apiEvents)) {
//     if (apiEvents.items && Array.isArray(apiEvents.items)) {
//       eventsArray = apiEvents.items
//     } else {
//       console.warn(
//         'transformEventList received non-array data without items property:',
//         apiEvents
//       )
//       return []
//     }
//   }

//   // Handle cases where apiEvents is not an array
//   if (!Array.isArray(eventsArray)) {
//     console.warn('transformEventList received non-array data:', apiEvents)
//     return []
//   }

//   return eventsArray.map(event => ({
//     ...transformEventListItem(event, isExperience),
//     featured: isFeatured
//   }))
// }

// /**
//  * Format price for display
//  * @param {number} price - Price value
//  * @returns {string} Formatted price string
//  */
// export const formatPrice = price => {
//   return `KES ${price.toLocaleString()}`
// }

// /**
//  * Format date for display
//  * @param {string} dateString - Date string from API
//  * @returns {string} Formatted date string
//  */
// export const formatDate = dateString => {
//   const date = new Date(dateString)
//   return date.toLocaleDateString('en-KE', {
//     month: 'long',
//     day: 'numeric',
//     year: 'numeric'
//   })
// }

// /**
//  * Format time for display
//  * @param {string} timeString - Time string from API (HH:MM format)
//  * @returns {string} Formatted time string
//  */
// export const formatTime = timeString => {
//   if (!timeString) return ''

//   const [hours, minutes] = timeString.split(':')
//   const hour = parseInt(hours, 10)
//   const ampm = hour >= 12 ? 'PM' : 'AM'
//   const displayHour = hour % 12 || 12

//   return `${displayHour}:${minutes} ${ampm}`
// }















/**
 * Transform API event data to match the frontend component structure
 */

/**
 * Helper function to get the correct image URL
 */
const getEventImageUrl = (event) => {
  if (!event) return null

  // 1. Check images array with cover_image_index
  if (event.images && Array.isArray(event.images) && event.images.length > 0) {
    const coverIndex = event.cover_image_index ?? 0
    const image = event.images[coverIndex]
    if (image) {
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return image
      }
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')
        .replace(/\/api$/, '')
        .replace(/\/api\/$/, '')
      return `${baseUrl}/storage/${image}`
    }
  }

  // 2. Check poster_url
  if (event.poster_url) {
    if (event.poster_url.startsWith('http://') || event.poster_url.startsWith('https://')) {
      return event.poster_url
    }
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')
      .replace(/\/api$/, '')
      .replace(/\/api\/$/, '')
    return `${baseUrl}/storage/${event.poster_url}`
  }

  // 3. Check direct image field
  if (event.image) {
    if (event.image.startsWith('http://') || event.image.startsWith('https://')) {
      return event.image
    }
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')
      .replace(/\/api$/, '')
      .replace(/\/api\/$/, '')
    return `${baseUrl}/storage/${event.image}`
  }

  // 4. Check folder/filename combination
  if (event.folder && event.filename) {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')
      .replace(/\/api$/, '')
      .replace(/\/api\/$/, '')
    return `${baseUrl}/storage/${event.folder}/${event.filename}`
  }

  return null
}

/**
 * Transform event list item from API
 * @param {Object} apiEvent - Event data from API
 * @param {boolean} isExperience - Whether this is from the experiences endpoint
 * @returns {Object} Transformed event object
 */
export const transformEventListItem = (apiEvent, isExperience = false) => {
  // 🔍 DEBUG: Log the raw API event data
  console.log('📥 transformEventListItem - raw apiEvent:', {
    title: apiEvent.title,
    images: apiEvent.images,
    cover_image_index: apiEvent.cover_image_index,
    poster_url: apiEvent.poster_url,
    folder: apiEvent.folder,
    filename: apiEvent.filename
  })

  // For promotional events, use price_from; otherwise use price_range.min
  const getPrice = () => {
    if (apiEvent.event_type === 'promotional' && apiEvent.price_from) {
      return parseFloat(apiEvent.price_from)
    }
    return apiEvent.price_range?.min || 0
  }

  // Get the correct cover image
  const coverImage = getEventImageUrl(apiEvent)

  const transformed = {
    id: apiEvent.id,
    uuid: apiEvent.uuid,
    slug: apiEvent.slug,
    cover_image_index: apiEvent.cover_image_index ?? 0,
    title: apiEvent.title,
    description: apiEvent.short_description || '',
    shortDescription: apiEvent.short_description || '',
    date: apiEvent.from,
    time: apiEvent.from_time,
    endTime: apiEvent.to_time,
    venue: apiEvent.location,
    location: apiEvent.location,
    image: coverImage || '/placeholder-event.jpg',
    images: apiEvent.images || [],
    folder: apiEvent.folder,
    filename: apiEvent.filename,
    category: apiEvent.category?.name?.toLowerCase() || 'general',
    featured: false,
    price: getPrice(),
    priceRange: apiEvent.price_range,
    event_type: isExperience ? 'promotional' : apiEvent.event_type,
    price_from: apiEvent.price_from,
    external_link: apiEvent.external_link,
    currency: apiEvent.currency || 'KES',
    isExperience: isExperience,
    tickets: []
  }

  // 🔍 DEBUG: Log the transformed output
  console.log('📤 transformEventListItem - transformed:', {
    title: transformed.title,
    images: transformed.images,
    cover_image_index: transformed.cover_image_index,
    image: transformed.image
  })

  return transformed
}



/**
 * Transform detailed event data from API
 * @param {Object} apiEvent - Detailed event data from API
 * @returns {Object} Transformed event object
 */
export const transformEventDetails = apiEvent => {
  // Parse highlights and lineup if they are JSON strings
  const parseJsonField = field => {
    if (!field) return []
    if (Array.isArray(field)) return field
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return []
      }
    }
    return []
  }

  // Get the correct cover image
  const coverImage = getEventImageUrl(apiEvent)

  console.log(
    'expected event type ->',
    (apiEvent.type === 'event' ? apiEvent.event_type : apiEvent.type) ||
      'ticketed'
  )

  return {
    id: apiEvent.id,
    uuid: apiEvent.uuid,
    slug: apiEvent.slug,
    cover_image_index: apiEvent.cover_image_index ?? 0,
    title: apiEvent.title,
    description: apiEvent.description || apiEvent.short_description || '',
    shortDescription: apiEvent.short_description || '',
    date: apiEvent.from,
    endDate: apiEvent.to,
    time: apiEvent.from_time,
    endTime: apiEvent.to_time,
    venue: apiEvent.location,
    location: apiEvent.location,
    googleMapsLocation: apiEvent.google_maps_location,
    latitude: apiEvent.latitude,
    longitude: apiEvent.longitude,
    eventType:
      (apiEvent.type === 'event' ? apiEvent.event_type : apiEvent.type) ||
      'ticketed',
    externalLink: apiEvent.external_link,
    image: coverImage || '/placeholder-event.jpg',
    images: apiEvent.images || (coverImage ? [coverImage] : []),
    currency: apiEvent.currency || 'KES',
    priceFrom: apiEvent.price_from,
    category: apiEvent.category?.name?.toLowerCase() || 'general',
    featured: false,
    highlights: parseJsonField(apiEvent.event_highlights),
    lineup: parseJsonField(apiEvent.lineup),
    userId: apiEvent.user_id,
    organizer: apiEvent.user
      ? {
          name: apiEvent.user.name,
          email: apiEvent.user.email,
          profile_photo_url: apiEvent.user.profile_photo_url,
          bio: apiEvent.user.bio,
          social_links: apiEvent.user.social_links
        }
      : {
          name: apiEvent.owner,
          email: apiEvent.email,
          phone: apiEvent.phone
        },
    tickets: (apiEvent.tickets || []).map(transformTicket)
  }
}

/**
 * Transform ticket data from API
 * @param {Object} apiTicket - Ticket data from API
 * @returns {Object} Transformed ticket object
 */
export const transformTicket = apiTicket => {
  return {
    id: apiTicket.id.toString(),
    name: apiTicket.name,
    description: apiTicket.description || '',
    price: parseFloat(apiTicket.price) || 0,
    available: parseInt(apiTicket.available) || 0,
    total: parseInt(apiTicket.total) || 0,
    ticketType: apiTicket.ticket_type,
    groupSize: apiTicket.group_size,
    status: apiTicket.status,

    // Sale Controls
    sales_status: apiTicket.sales_status || 'open',
    sale_starts_at: apiTicket.sale_starts_at || null,
    sale_ends_at: apiTicket.sale_ends_at || null,
    is_available: apiTicket.is_available ?? true,
    sale_status_label: apiTicket.sale_status_label || 'Available',
  }
}

/**
 * Transform multiple events from API
 * @param {Array|Object} apiEvents - Array of events from API or object with items property
 * @param {boolean} isFeatured - Whether these are featured events
 * @param {boolean} isExperience - Whether these are from the experiences endpoint
 * @returns {Array} Array of transformed events
 */
export const transformEventList = (
  apiEvents,
  isFeatured = false,
  isExperience = false
) => {
  // Handle cases where apiEvents is an object with items property
  let eventsArray = apiEvents
  if (apiEvents && typeof apiEvents === 'object' && !Array.isArray(apiEvents)) {
    if (apiEvents.items && Array.isArray(apiEvents.items)) {
      eventsArray = apiEvents.items
    } else {
      console.warn(
        'transformEventList received non-array data without items property:',
        apiEvents
      )
      return []
    }
  }

  // Handle cases where apiEvents is not an array
  if (!Array.isArray(eventsArray)) {
    console.warn('transformEventList received non-array data:', apiEvents)
    return []
  }

  return eventsArray.map(event => ({
    ...transformEventListItem(event, isExperience),
    featured: isFeatured
  }))
}

/**
 * Format price for display
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export const formatPrice = price => {
  return `KES ${price.toLocaleString()}`
}

/**
 * Format date for display
 * @param {string} dateString - Date string from API
 * @returns {string} Formatted date string
 */
export const formatDate = dateString => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-KE', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format time for display
 * @param {string} timeString - Time string from API (HH:MM format)
 * @returns {string} Formatted time string
 */
export const formatTime = timeString => {
  if (!timeString) return ''

  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12

  return `${displayHour}:${minutes} ${ampm}`
}