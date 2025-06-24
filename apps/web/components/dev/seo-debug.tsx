"use client";

import { useState } from "react";

interface SEODebugProps {
  article: {
    title: string;
    excerpt?: string;
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
      ogImage?: { asset?: { url?: string } };
      noIndex?: boolean;
      canonicalUrl?: string;
    };
    image?: { asset?: { url?: string } };
    author?: { name?: string };
    categories?: Array<{ title: string }>;
    publishedAt: string;
    slug: { current: string };
  };
}

export function SEODebug({ article }: SEODebugProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pledge4peace.org";
  const articleUrl = `${baseUrl}/articles/${article.slug.current}`;

  const finalTitle = article.seo?.metaTitle || article.title;
  const finalDescription =
    article.seo?.metaDescription || article.excerpt || "";
  const finalKeywords = article.seo?.keywords || [];
  const finalOgImage =
    article.seo?.ogImage?.asset?.url || article.image?.asset?.url;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
      >
        SEO Debug
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-xl w-[400px] max-w-md p-4 text-sm max-h-96 overflow-y-auto">
          <h3 className="font-bold text-lg mb-4 text-gray-900">
            SEO Debug Info
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <strong className="text-gray-700">Meta Title:</strong>
              <p className="mt-1 p-2 bg-gray-50 rounded text-xs">
                {finalTitle}
              </p>
              <small className="text-gray-500">
                Length: {finalTitle.length} chars{" "}
                {finalTitle.length > 60 ? "⚠️ Too long" : "✅"}
              </small>
            </div>

            {/* Description */}
            <div>
              <strong className="text-gray-700">Meta Description:</strong>
              <p className="mt-1 p-2 bg-gray-50 rounded text-xs">
                {finalDescription}
              </p>
              <small className="text-gray-500">
                Length: {finalDescription.length} chars{" "}
                {finalDescription.length > 160 ? "⚠️ Too long" : "✅"}
              </small>
            </div>

            {/* Keywords */}
            <div>
              <strong className="text-gray-700">Keywords:</strong>
              <p className="mt-1 p-2 bg-gray-50 rounded text-xs">
                {finalKeywords.length > 0
                  ? finalKeywords.join(", ")
                  : "No keywords set"}
              </p>
            </div>

            {/* OG Image */}
            <div>
              <strong className="text-gray-700">Open Graph Image:</strong>
              <p className="mt-1 p-2 bg-gray-50 rounded text-xs break-all">
                {finalOgImage ? finalOgImage : "No image set"}
              </p>
              {finalOgImage && (
                <img
                  src={finalOgImage}
                  alt="OG Preview"
                  className="mt-2 w-full h-20 object-cover rounded"
                />
              )}
            </div>

            {/* No Index */}
            <div>
              <strong className="text-gray-700">Indexing:</strong>
              <p className="mt-1 p-2 bg-gray-50 rounded text-xs">
                {article.seo?.noIndex
                  ? "🚫 No Index (won't appear in search)"
                  : "✅ Will be indexed"}
              </p>
            </div>

            {/* Canonical URL */}
            <div>
              <strong className="text-gray-700">Canonical URL:</strong>
              <p className="mt-1 p-2 bg-gray-50 rounded text-xs break-all">
                {article.seo?.canonicalUrl || articleUrl}
              </p>
            </div>

            {/* Testing URLs */}
            <div>
              <strong className="text-gray-700">Test Your SEO:</strong>
              <div className="mt-2 space-y-1">
                <a
                  href={`https://developers.facebook.com/tools/debug/sharing/?q=${encodeURIComponent(articleUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline text-xs"
                >
                  📘 Facebook Debugger
                </a>
                <a
                  href={`https://cards-dev.twitter.com/validator?url=${encodeURIComponent(articleUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline text-xs"
                >
                  🐦 Twitter Card Validator
                </a>
                <a
                  href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(articleUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline text-xs"
                >
                  🔍 Google Rich Results
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
