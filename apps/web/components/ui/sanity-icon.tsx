import Image from "next/image";

interface SanityIconProps {
  iconUrl: string;
}

export const SanityIcon = ({ iconUrl }: SanityIconProps) => {
  return (
    <Image
      src={iconUrl}
      alt="Support icon"
      width={28}
      height={28}
      className="text-[#86AC9D]"
    />
  );
};
