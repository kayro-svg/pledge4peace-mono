type HeroVideoProps = {
  videoUrl: string | undefined;
};

export default function HeroVideo({ videoUrl }: HeroVideoProps) {
  return (
    <div className="w-full h-fit bg-background flex items-center justify-center px-4">
      <div className="relative w-full h-[600px]">
        <div className="absolute inset-0">
          <div className="w-full h-full overflow-hidden rounded-[40px_00px_0px_40px]">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
