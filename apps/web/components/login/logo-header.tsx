import Image from "next/image";

export function LogoHeader() {
  return (
    <div className="absolute top-4 left-0 right-0 flex justify-center">
      <div className="flex items-center">
        <Image
          src="/p4p_logo_renewed.png"
          alt="Pledge4Peace"
          width={300}
          height={300}
        />
      </div>
    </div>
  );
}
