# Lottie Animations Directory

This directory is for storing Lottie animation JSON files.

## How to Use Lottie Animations

1. Download Lottie animations from [LottieFiles](https://lottiefiles.com/) or create your own
2. Place the JSON files in this directory
3. Use the `LottieAnimation` component in your React components:

```tsx
import LottieAnimation from '@/components/LottieAnimation';
import animationData from '@/public/animations/your-animation.json';

// In your component:
<LottieAnimation 
  animationData={animationData}
  height={200}
  width={200}
  loop={true}
  autoplay={true}
/>
```

Or load from a path:
```tsx
<LottieAnimation 
  path="/animations/your-animation.json"
  height={200}
  width={200}
/>
```

## Recommended Animations for Real Estate Sites

- Building construction animations
- Property search icons
- Success/checkmark animations
- Loading indicators
- Smooth transitions
- Decorative geometric patterns

