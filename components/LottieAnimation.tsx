'use client';

import dynamic from 'next/dynamic';
import { CSSProperties } from 'react';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LottieAnimationProps {
  animationData?: object;
  path?: string;
  loop?: boolean;
  autoplay?: boolean;
  style?: CSSProperties;
  className?: string;
  height?: number | string;
  width?: number | string;
}

export default function LottieAnimation({
  animationData,
  path,
  loop = true,
  autoplay = true,
  style,
  className,
  height = 200,
  width = 200,
}: LottieAnimationProps) {
  // If no animation data or path is provided, return null
  // In production, you would load Lottie files from /public/animations/ or an API
  if (!animationData && !path) {
    return null;
  }

  return (
    <div className={className} style={{ height, width, ...style }}>
      <Lottie
        animationData={animationData}
        path={path}
        loop={loop}
        autoplay={autoplay}
        style={{ height, width }}
      />
    </div>
  );
}
