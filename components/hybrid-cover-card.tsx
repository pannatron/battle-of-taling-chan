import Image from 'next/image';

interface HybridCoverCardProps {
  coverImage1: string | null;
  coverImage2?: string | null;
  alt?: string;
  className?: string;
}

export function HybridCoverCard({ 
  coverImage1, 
  coverImage2, 
  alt = 'Cover', 
  className = '' 
}: HybridCoverCardProps) {
  // If we have two images, show split view
  if (coverImage1 && coverImage2) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {/* Left half - First image */}
        <div className="absolute top-0 bottom-0 left-0 w-1/2 overflow-hidden">
          <Image
            src={coverImage1}
            alt={`${alt} - Left`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.5vw"
            priority
          />
        </div>

        {/* Right half - Second image */}
        <div className="absolute top-0 bottom-0 right-0 w-1/2 overflow-hidden">
          <Image
            src={coverImage2}
            alt={`${alt} - Right`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.5vw"
            priority
          />
        </div>

        {/* Divider line */}
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-white to-transparent opacity-50 -translate-x-1/2 z-10" />
      </div>
    );
  }

  // Single image fallback
  if (coverImage1) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <Image
          src={coverImage1}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority
        />
      </div>
    );
  }

  // No image fallback
  return (
    <div className={`w-full h-full bg-gradient-to-br from-muted to-muted/50 ${className}`} />
  );
}
