import Image from "next/image";

export function LogoHeader() {
  return (
    <div className="absolute top-5 left-0 right-0 flex justify-center">
      <div className="flex items-center">
        <Image
          src="/pleadge4peace_header_logo.png"
          alt="Pledge4Peace"
          width={300}
          height={300}
        />
      </div>
    </div>
  );
}
