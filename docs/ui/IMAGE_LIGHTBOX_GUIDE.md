# Image Lightbox - User Guide

## Overview

The Image Lightbox allows users to view event posters in full size with zoom, download, and navigation controls.

## How to Use

### Opening the Lightbox

**Method 1: Click the Image**
- Click anywhere on the event poster
- Lightbox opens instantly

**Method 2: Hover Button**
- Hover over the event image
- Click "View Full Image" button that appears

### Controls

#### Top Right Corner
```
[Zoom Out] [Zoom In] [Download] [Close]
    -         +         ↓         ✕
```

#### Zoom Controls
- **Zoom Out (-)**: Decrease image size
  - Minimum: 50%
  - Click multiple times to zoom out further
  
- **Zoom In (+)**: Increase image size
  - Maximum: 300%
  - Click multiple times to zoom in further

#### Download Button (↓)
- Downloads the event poster to your device
- Filename: `{event-title}.jpg`

#### Close Button (✕)
- Closes the lightbox
- Returns to event details page

### Keyboard Shortcuts

- **ESC** - Close lightbox
- Works from anywhere when lightbox is open

### Zoom Indicator

**Top Left Corner**
- Shows current zoom level
- Example: "100%", "150%", "200%"
- Only visible when zoomed (not at 100%)

### Image Title

**Bottom Center**
- Shows event title
- Helps identify which event you're viewing

### Instructions

**Bottom Right Corner**
- "Press ESC to close"
- Reminder for keyboard shortcut

## Features

### 1. Full-Screen Viewing
- Image displayed at maximum size
- Dark background for better focus
- No distractions

### 2. Zoom Functionality
- **Range**: 50% to 300%
- **Increments**: 25% per click
- **Smooth transitions**
- **Scroll support** when zoomed

### 3. Download
- One-click download
- Original quality
- Automatic filename

### 4. Responsive Design
- Works on all screen sizes
- Touch-friendly on mobile
- Optimized for tablets

## Mobile Experience

### Touch Gestures
- **Tap image** - Open lightbox
- **Tap outside** - Close lightbox
- **Pinch to zoom** - Native browser zoom
- **Swipe** - Scroll when zoomed

### Mobile Controls
- Larger touch targets
- Easy-to-reach buttons
- Optimized layout

## Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [100%]                    [-] [+] [↓] [✕]            │
│                                                         │
│                                                         │
│                    ┌─────────────┐                     │
│                    │             │                     │
│                    │   EVENT     │                     │
│                    │   POSTER    │                     │
│                    │   IMAGE     │                     │
│                    │             │                     │
│                    └─────────────┘                     │
│                                                         │
│                                                         │
│              [Event Title Here]                         │
│                                          [Press ESC]    │
└─────────────────────────────────────────────────────────┘
```

## Examples

### Viewing a Concert Poster
1. Navigate to concert event
2. Click on the poster image
3. Lightbox opens with full poster
4. Zoom in to see artist details
5. Download for later reference

### Checking Event Details
1. Open event details page
2. Hover over poster
3. Click "View Full Image"
4. Read all text on poster
5. Press ESC to close

### Saving Event Poster
1. Open lightbox
2. Click download button (↓)
3. Image saves to Downloads folder
4. Share with friends

## Tips & Tricks

### Best Practices
- **Zoom in** to read small text on posters
- **Download** posters you're interested in
- **Use ESC** for quick closing
- **Click outside** image to close

### Performance
- Images load progressively
- Smooth animations
- No lag on zoom
- Efficient memory usage

### Accessibility
- Keyboard navigation supported
- Screen reader friendly
- High contrast controls
- Clear visual feedback

## Troubleshooting

### Lightbox Won't Open
- **Check**: Event has valid image
- **Try**: Refresh the page
- **Verify**: JavaScript is enabled

### Image Blurry When Zoomed
- **Normal**: Some images have lower resolution
- **Solution**: Original image quality limitation
- **Note**: Download for best quality

### Download Not Working
- **Check**: Browser download settings
- **Try**: Different browser
- **Verify**: Popup blocker settings

### Controls Not Visible
- **Check**: Screen size
- **Try**: Scroll to see controls
- **Note**: Controls auto-hide on small screens

## Browser Support

### Desktop
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile
- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+
- ✅ Samsung Internet 14+
- ✅ Firefox Mobile 88+

## Privacy & Security

### Data Handling
- No image data stored
- No tracking
- No external requests
- Client-side only

### Downloads
- Direct download
- No server processing
- Original quality maintained
- Secure connection (HTTPS)

## Feedback

### Report Issues
- Image not loading
- Controls not working
- Performance problems
- Feature requests

### Contact
- Development team
- Support email
- GitHub issues

---

**Quick Reference**

| Action | Method |
|--------|--------|
| Open | Click image or "View Full Image" |
| Close | ESC key or X button |
| Zoom In | + button |
| Zoom Out | - button |
| Download | ↓ button |
| Navigate | Click outside to close |

**Keyboard Shortcuts**

| Key | Action |
|-----|--------|
| ESC | Close lightbox |

**Zoom Levels**

| Level | Percentage |
|-------|------------|
| Min | 50% |
| Default | 100% |
| Max | 300% |
| Step | 25% |

---

**Version**: 1.0.0  
**Last Updated**: January 22, 2026  
**Status**: ✅ Production Ready
