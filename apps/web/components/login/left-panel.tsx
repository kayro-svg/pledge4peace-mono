import Image from "next/image";

export function LeftPanel() {
  return (
    <div className="hidden lg:flex p-8 rounded-3xl lg:w-1/2 flex-col text-white justify-between relative overflow-hidden z-20">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/p4p_login_image.png"
          alt="Login background"
          fill
          className="object-cover"
        />
        {/* Opaque cover */}
        <div className="absolute inset-0 bg-black opacity-45"></div>
      </div>

      {/* Content */}
      <div className="z-10">
        <p className="uppercase text-xs tracking-widest font-medium mb-8">
          To Solve The World&apos;s Problems
        </p>
      </div>

      <div className="z-10">
        <h1 className="text-6xl font-bold leading-tight mb-6">
          One <br />
          Pledge <br />
          At A Time
        </h1>
        <p className="text-sm text-white/90 max-w-md">
          Pledge4Peace is a global movement that empowers individuals to make a
          difference. Join our community of peace advocates and pledge to make a
          positive impact on the world.
        </p>
      </div>
    </div>
  );
}
