import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface LeaderCardProps {
  image: string;
  name: string;
  position: string;
}

export default function LeaderCard({ image, name, position }: LeaderCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300 transform group ease-in-out">
      <div className="relative h-80 overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="p-5 absolute bottom-0 left-0 right-0 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div>
            <h4 className="text-lg font-bold text-white mb-1 group-hover:text-brand-500 transition-colors">
              {name}
            </h4>
            <p className="text-sm text-white">{position}</p>
          </div>
          <Link
            href="/leader-details"
            className="text-sm text-brand-500 font-medium flex itemsextcenter border border-brand-500 rounded-full px-4 py-2 text-[#FFFFFF] hover:bg-[#2f4858] hover:text-white hover:border-transparent transition-colors"
          >
            View Profile{" "}
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
}
