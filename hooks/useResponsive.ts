import { useEffect, useState } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';

interface ResponsiveConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  screenWidth: number;
  screenHeight: number;
  videoMaxWidth: number;
  videoHeight: number;
  buttonPadding: {
    horizontal: number;
    vertical: number;
  };
  fontSize: {
    queueInfo: number;
    videoId: number;
    button: number;
  };
  spacing: {
    controls: number;
    buttonRow: number;
    queueInfo: number;
    videoId: number;
  };
}

const getResponsiveConfig = (width: number, height: number): ResponsiveConfig => {
  const isLandscape = width > height;
  const isPortrait = height > width;
  
  // Determine device type based on screen width
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  // Calculate video dimensions with iOS-specific adjustments
  let videoMaxWidth: number;
  let videoHeight: number;

  if (Platform.OS === 'ios') {
    if (isMobile) {
      videoMaxWidth = width;
      videoHeight = Math.min((width * 9) / 16, 250); // Smaller height for iOS mobile
    } else if (isTablet) {
      videoMaxWidth = Math.min(width * 0.8, 900);
      videoHeight = (videoMaxWidth * 9) / 16;
    } else {
      videoMaxWidth = Math.min(width * 0.7, 1000);
      videoHeight = (videoMaxWidth * 9) / 16;
    }
  } else {
    // Android and Web
    if (isMobile) {
      videoMaxWidth = width;
      videoHeight = Math.min((width * 9) / 16, 300);
    } else if (isTablet) {
      videoMaxWidth = Math.min(width * 0.8, 900);
      videoHeight = (videoMaxWidth * 9) / 16;
    } else {
      videoMaxWidth = Math.min(width * 0.7, 1000);
      videoHeight = (videoMaxWidth * 9) / 16;
    }
  }

  // Responsive button padding with iOS adjustments
  const buttonPadding = {
    horizontal: Platform.OS === 'ios' ? (isMobile ? 15 : isTablet ? 18 : 20) : (isMobile ? 12 : isTablet ? 15 : 18),
    vertical: Platform.OS === 'ios' ? (isMobile ? 12 : isTablet ? 14 : 16) : (isMobile ? 8 : isTablet ? 10 : 12),
  };

  // Responsive font sizes with iOS adjustments
  const fontSize = {
    queueInfo: Platform.OS === 'ios' ? (isMobile ? 16 : isTablet ? 18 : 20) : (isMobile ? 14 : isTablet ? 16 : 18),
    videoId: Platform.OS === 'ios' ? (isMobile ? 12 : isTablet ? 14 : 16) : (isMobile ? 10 : isTablet ? 12 : 14),
    button: Platform.OS === 'ios' ? (isMobile ? 14 : isTablet ? 16 : 18) : (isMobile ? 12 : isTablet ? 14 : 16),
  };

  // Responsive spacing with iOS adjustments
  const spacing = {
    controls: Platform.OS === 'ios' ? (isMobile ? 20 : isTablet ? 25 : 30) : (isMobile ? 15 : isTablet ? 20 : 25),
    buttonRow: Platform.OS === 'ios' ? (isMobile ? 20 : isTablet ? 25 : 30) : (isMobile ? 15 : isTablet ? 20 : 25),
    queueInfo: Platform.OS === 'ios' ? (isMobile ? 12 : isTablet ? 14 : 16) : (isMobile ? 8 : isTablet ? 10 : 12),
    videoId: Platform.OS === 'ios' ? (isMobile ? 20 : isTablet ? 25 : 30) : (isMobile ? 15 : isTablet ? 20 : 25),
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    screenWidth: width,
    screenHeight: height,
    videoMaxWidth,
    videoHeight,
    buttonPadding,
    fontSize,
    spacing,
  };
};

export const useResponsive = (): ResponsiveConfig => {
  const [config, setConfig] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return getResponsiveConfig(width, height);
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setConfig(getResponsiveConfig(window.width, window.height));
    });

    return () => subscription?.remove();
  }, []);

  return config;
};
