# Changelog

All notable changes to the WorkspaceShare platform will be documented in this file.

## [Unreleased]

## [1.2.0] - 2025-04-24

### Added
- New meeting rooms and single desks in Enschede, Haaksbergen, and Hengelo with accurate coordinates
- Improved home page with "Workspaces Near You" section showing 24 workspaces
- 4-column responsive grid layout for workspace listings
- Detailed Netlify deployment documentation in README.md
- Enhanced setup-env.js script with better DATABASE_URL validation

### Fixed
- Resolved Netlify deployment issues with animated icons
- Fixed missing dependencies (motion/react) for animated components
- Improved error handling in environment variable setup
- Updated netlify.toml configuration for better Next.js compatibility

## [1.1.0] - 2025-04-23

### Added
- Animated icons library integration with 15 beautifully crafted animated icons
- New showcase component for animated icons demonstration
- Documentation for using and extending the animated icons
- Side-scrolling quick filter component with animated icons

### Changed
- Updated README.md with animated icons usage examples
- Improved home page UI with animated elements

## [1.0.0] - 2025-04-22

### Added
- Hero section redesign with improved layout and responsiveness
- Updated workspace type categories throughout the app:
  - Single Desk
  - Private Office
  - Meeting Room
  - Co-Working Space
- Structured image directory in `public/images` with organized subfolders
- Added four new co-working spaces in Enschede with full details and images

### Fixed
- Navigation menu and hero section breakpoints unified for consistent mobile/desktop transitions
- Fixed "Red Stapler" text duplication issue at 742px width

### Changed
- Improved workspace type selection UI with new icons and descriptions
- Enhanced workspace details step with support for new workspace types
- Updated space listing form with new workspace categories
