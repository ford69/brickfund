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
  // If no animation data is provided, return null
  // Note: lottie-react v2+ only supports animationData, not path
  // To use path, you need to fetch the JSON first or use a different approach
  if (!animationData) {
    return null;
  }

  return (
    <div className={className} style={{ height, width, ...style }}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ height, width }}
      />
    </div>
  );
}
