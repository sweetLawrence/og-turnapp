// api/og/events/[identifier].js

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { identifier } = req.query;
  
  if (!identifier) {
    return res.status(400).send('Missing event identifier');
  }

  try {
    // Fetch event data from your backend API
    const apiUrl = `${process.env.API_BASE_URL || 'https://api.turnapp.events'}/api/events/${identifier}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`API returned ${response.status} for event: ${identifier}`);
      return res.status(404).send('Event not found');
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      return res.status(404).send('Event not found');
    }

    const event = data.data;

    // Build the image URL
    const imageUrl = event.poster_url || 
                     (event.images && event.images.length > 0 ? event.images[0] : null) ||
                     'https://turnapp.events/og-image.jpg';

    // Sanitize description (remove HTML tags, limit length)
    const cleanDescription = (event.short_description || 
                             event.description?.replace(/<[^>]*>/g, '').substring(0, 150) || 
                             'Check out this amazing event on TurnApp!').trim();

    // Build the share URL
    const shareIdentifier = event.slug || event.uuid || event.id;
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://turnapp.events'}/${shareIdentifier}`;

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Generate HTML with OG tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${escapeHtml(event.title)} - TurnApp</title>
    <meta name="title" content="${escapeHtml(event.title)} - TurnApp" />
    <meta name="description" content="${escapeHtml(cleanDescription)}" />
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapeHtml(shareUrl)}" />
    <meta property="og:title" content="${escapeHtml(event.title)} - TurnApp" />
    <meta property="og:description" content="${escapeHtml(cleanDescription)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="TurnApp" />
    <meta property="og:locale" content="en_KE" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${escapeHtml(shareUrl)}" />
    <meta name="twitter:title" content="${escapeHtml(event.title)} - TurnApp" />
    <meta name="twitter:description" content="${escapeHtml(cleanDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    
    <!-- Event Schema (Structured Data) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": "${escapeHtml(event.title)}",
        "description": "${escapeHtml(cleanDescription)}",
        "startDate": "${event.from || event.date || ''}",
        "endDate": "${event.to || event.endDate || ''}",
        "location": {
            "@type": "Place",
            "name": "${escapeHtml(event.location || event.venue || '')}",
            "address": "${escapeHtml(event.location || '')}"
        },
        "image": "${escapeHtml(imageUrl)}",
        "url": "${escapeHtml(shareUrl)}"
    }
    </script>
    
    <!-- Redirect to React SPA after crawler reads tags -->
    <meta http-equiv="refresh" content="2; url=${escapeHtml(shareUrl)}" />
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: white;
            padding: 20px;
        }
        .preview-card {
            max-width: 420px;
            width: 100%;
            background: #1a1a1a;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #2a2a2a;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .preview-card .image-container {
            width: 100%;
            height: 240px;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .preview-card .image-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .preview-content { padding: 20px; }
        .preview-badge {
            display: inline-block;
            background: #2a2a2a;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            color: #888;
            margin-bottom: 8px;
        }
        .preview-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
            color: white;
        }
        .preview-desc {
            font-size: 14px;
            color: #a0a0a0;
            line-height: 1.5;
            margin-bottom: 12px;
        }
        .preview-meta {
            font-size: 13px;
            color: #666;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }
        .redirect-note {
            text-align: center;
            color: #444;
            font-size: 13px;
            margin-top: 16px;
        }
        .brand {
            text-align: center;
            color: #333;
            font-size: 12px;
            margin-top: 12px;
            letter-spacing: 2px;
        }
        .brand span { color: #DC143C; }
    </style>
</head>
<body>
    <div class="preview-card">
        <div class="image-container">
            ${event.images && event.images.length > 0 ? 
                `<img src="${escapeHtml(event.images[0])}" alt="${escapeHtml(event.title)}" />` :
                event.poster_url ? 
                `<img src="${escapeHtml(event.poster_url)}" alt="${escapeHtml(event.title)}" />` :
                `<div style="color:#444;font-size:14px;text-align:center;">
                    <div style="font-size:48px;margin-bottom:8px;">🎟️</div>
                    <div>${escapeHtml(event.title)}</div>
                </div>`
            }
        </div>
        <div class="preview-content">
            <div class="preview-badge">📍 ${escapeHtml(event.location || event.venue || 'Location TBA')}</div>
            <div class="preview-title">${escapeHtml(event.title)}</div>
            <div class="preview-desc">${escapeHtml(cleanDescription)}</div>
            <div class="preview-meta">
                ${event.from ? `<span>📅 ${new Date(event.from).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</span>` : ''}
                ${event.from_time ? `<span>🕐 ${event.from_time.substring(0, 5)}</span>` : ''}
            </div>
        </div>
    </div>
    <div class="redirect-note">Loading event...</div>
    <div class="brand">Turn<span>App</span></div>
    <script>
        setTimeout(function() {
            window.location.href = "${escapeHtml(shareUrl)}";
        }, 3000);
    </script>
</body>
</html>`;

    // Return the HTML
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('OG Generation Error:', error);
    res.status(500).send('Internal Server Error');
  }
}