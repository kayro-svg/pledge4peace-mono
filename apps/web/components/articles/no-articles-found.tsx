import Image from "next/image";

export default function NoArticlesFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-64 h-64 mb-8">
        <Image
          src="/images/no-results.svg"
          alt="No articles found"
          fill
          className="object-contain"
        />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        No Articles Found
      </h3>
      <p className="text-gray-600 text-center max-w-md">
        We couldn't find any articles matching your search criteria. Try
        adjusting your filters or search terms.
      </p>
    </div>
  );
}
