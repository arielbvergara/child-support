const YOUTUBE_NOCOOKIE_BASE_URL = 'https://www.youtube-nocookie.com/embed/';

interface VideoEmbedProps {
  videoId: string;
  title: string;
}

export function VideoEmbed({ videoId, title }: VideoEmbedProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
      <iframe
        src={`${YOUTUBE_NOCOOKIE_BASE_URL}${videoId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
      />
    </div>
  );
}
