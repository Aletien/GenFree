// Utility functions to load CMS data
// This will eventually be replaced with dynamic loading from the CMS

import settingsData from '../data/settings.json';
import heroData from '../data/hero.json';
import aboutData from '../data/about.json';

// Load site settings
export const getSettings = () => {
  return settingsData;
};

// Load hero content
export const getHeroContent = () => {
  return heroData;
};

// Load about page content
export const getAboutContent = () => {
  return aboutData;
};

// Fallback gallery data (will be replaced by CMS)
export const getGalleryData = () => {
  return [
    {
      id: 1,
      title: 'Worship Night',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      category: 'Worship',
      description: 'An evening of powerful worship and praise',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Community Outreach',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
      category: 'Community',
      description: 'Serving our local community with love',
      date: '2024-01-12'
    },
    {
      id: 3,
      title: 'Youth Conference',
      image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
      category: 'Youth',
      description: 'Empowering the next generation',
      date: '2024-01-08'
    },
    {
      id: 4,
      title: 'Bible Study',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      category: 'Community',
      description: 'Weekly Bible study and fellowship',
      date: '2024-01-05'
    },
    {
      id: 5,
      title: 'Leadership Training',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
      category: 'Leadership',
      description: 'Developing servant leaders',
      date: '2024-01-03'
    },
    {
      id: 6,
      title: 'Praise Session',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      category: 'Worship',
      description: 'Community coming together in praise',
      date: '2024-01-01'
    },
    {
      id: 7,
      title: 'Children Ministry',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
      category: 'Youth',
      description: 'Nurturing young hearts for Jesus',
      date: '2023-12-28'
    },
    {
      id: 8,
      title: 'Prayer Meeting',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
      category: 'Worship',
      description: 'United in prayer and supplication',
      date: '2023-12-25'
    },
    {
      id: 9,
      title: 'Prayer Circle',
      image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
      category: 'Worship',
      description: 'Intimate prayer and meditation time',
      date: '2023-12-20'
    }
  ];
};