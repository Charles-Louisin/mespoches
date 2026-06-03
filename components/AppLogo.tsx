import Image from 'next/image';

const SIZE_PX = {
  xs: 32,
  sm: 40,
  md: 48,
  lg: 80,
  xl: 120,
} as const;

type AppLogoSize = keyof typeof SIZE_PX;

interface AppLogoProps {
  size?: AppLogoSize;
  className?: string;
  priority?: boolean;
  alt?: string;
}

/** Logo officiel MES POCHES (monogramme MP). */
export default function AppLogo({
  size = 'md',
  className = '',
  priority = false,
  alt = 'MES POCHES',
}: AppLogoProps) {
  const px = SIZE_PX[size];

  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={px}
      height={px}
      priority={priority}
      className={`rounded-2xl object-cover shrink-0 ${className}`}
      unoptimized
    />
  );
}
