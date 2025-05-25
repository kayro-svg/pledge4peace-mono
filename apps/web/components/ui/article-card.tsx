import Image from "next/image";
import Link from "next/link";

interface ArticleCardProps {
  image: string;
  category: string;
  title: string;
  description: string;
  author: {
    name: string;
    image: string;
  };
  date: string;
  slug: string;
}

export default function ArticleCard({
  image,
  category,
  title,
  description,
  author,
  date,
  slug,
}: ArticleCardProps) {
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-md transition-shadow">
      <Link href={`/articles/${slug}`} className="flex flex-col h-full">
        <div className="relative h-48 w-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="flex flex-col p-6 flex-1">
          {/* Category Tag */}
          <div>
            <span
              className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4"
              style={{
                backgroundColor: getCategoryColor(category),
                color: "white",
              }}
            >
              {category}
            </span>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#548281] transition-colors">
              {title}
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
          </div>
          {/* Author and Date */}
          <div className="flex items-center gap-3 mt-auto">
            {/* <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={author.image || "/p4p_rounded_logo.png"}
                alt={author.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div> */}
            <div className="flex flex-col">
              <p className="font-medium text-gray-900">{author.name}</p>
              <p className="text-sm text-gray-500">{formatDate(date)}</p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    "Peace Initiatives": "#548281",
    Community: "#FF6B6B",
    Events: "#4ECDC4",
    General: "#95A5A6",
  };

  return colors[category] || colors["General"];
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}
