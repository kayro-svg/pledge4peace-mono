import Image from "next/image";

export function LogoHeader() {
  return (
    <div className="flex items-center justify-center mb-6 md:mb-0">
      <Image
        src="/p4p_logo_renewed.png"
        alt="Pledge4Peace"
        width={300}
        height={300}
      />
    </div>
  );
}
