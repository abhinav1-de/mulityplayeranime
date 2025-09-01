# Overview

JustAnime is an open-source anime streaming platform that provides clean, ad-free anime viewing experience. The application is built with React and JavaScript, offering features like sub/dub anime support, mobile responsiveness, character information, and advanced video player controls including autoplay, auto-skip intro/outro, and auto-next episode functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with JavaScript (not TypeScript)
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with custom configurations and CSS variables
- **UI Components**: Custom component library with shadcn/ui integration
- **Routing**: React Router DOM for client-side navigation
- **State Management**: React Context API for global state (search functionality)

## Component Structure
- **Modular Design**: Components organized by feature (banner, player, sidebar, etc.)
- **Custom Hooks**: Reusable logic for search, watch controls, and tooltip positioning
- **Responsive Design**: Mobile-first approach with custom breakpoints
- **Video Player**: ArtPlayer integration with custom plugins for chapters, thumbnails, and subtitle upload

## Data Flow
- **API Integration**: Axios-based HTTP client for external anime API calls
- **Caching Strategy**: Local storage caching for home page data (24-hour expiry) and top search results (7-day expiry)
- **Error Handling**: Comprehensive error handling across all API utilities
- **Loading States**: Multiple loading states with skeleton components and bounce loaders

## Styling System
- **CSS Architecture**: Combination of Tailwind utility classes and custom CSS modules
- **Theme System**: Dark theme with CSS custom properties for consistent theming
- **Animation**: Custom CSS animations for shimmer effects, bouncing loaders, and transitions
- **Responsive Design**: Custom breakpoints for optimal viewing across devices

## Performance Optimizations
- **Code Splitting**: Component-level code splitting with React lazy loading
- **Image Optimization**: Lazy loading for anime posters and thumbnails
- **Caching**: Strategic caching of API responses to reduce server load
- **Bundle Optimization**: Vite's optimized bundling for production builds

# External Dependencies

## Core APIs
- **Anime API**: Primary data source for anime information, episodes, and streaming content
- **Worker URLs**: Multiple API endpoints for load balancing and redundancy

## Third-Party Services
- **Vercel Analytics**: User behavior tracking and performance monitoring
- **Vercel Speed Insights**: Core web vitals and performance metrics tracking

## Media Handling
- **ArtPlayer**: Advanced HTML5 video player with plugin ecosystem
- **HLS.js**: HTTP Live Streaming support for video content
- **Cheerio**: Server-side HTML parsing (likely for scraping functionality)

## UI and Styling
- **FontAwesome**: Icon library for UI elements
- **Radix UI**: Accessible UI primitives for interactive components
- **Swiper**: Touch-enabled carousel/slider component
- **Lucide React**: Modern icon library
- **React Icons**: Additional icon set

## Development Tools
- **ESLint**: Code linting with React-specific rules
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **Styled Components**: CSS-in-JS for dynamic styling needs

## Content and SEO
- **Comprehensive Meta Tags**: Open Graph, Twitter Cards, and SEO optimization
- **Robots.txt**: Search engine crawling configuration
- **Sitemap Integration**: XML sitemap for better search engine indexing