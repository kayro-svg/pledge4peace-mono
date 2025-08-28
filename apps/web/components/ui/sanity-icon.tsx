import Image from "next/image";
import { getSanityImageUrl } from "@/lib/sanity/image-helpers";

interface SanityIconProps {
  iconUrl: string;
}

export const SanityIcon = ({ iconUrl }: SanityIconProps) => {
  return (
    <Image
      src={getSanityImageUrl(iconUrl, 56, 56)}
      alt="Support icon"
      width={28}
      height={28}
      className="text-[#86AC9D]"
    />
  );
};
