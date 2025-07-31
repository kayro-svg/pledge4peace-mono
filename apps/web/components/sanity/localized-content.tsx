import { useLocaleContent } from "@/hooks/use-locale-content";
import { PortableText } from "@portabletext/react";

type LocalizedContentProps = {
  title?: any; // localeString
  description?: any; // localeText
  content?: any; // localeBlockContent
};

/**
 * Component for rendering localized content from Sanity
 */
export function LocalizedContent({
  title,
  description,
  content,
}: LocalizedContentProps) {
  const { getString, getText, getBlockContent, locale } = useLocaleContent();

  return (
    <div className="localized-content">
      {title && <h2>{getString(title)}</h2>}

      {description && (
        <div className="description">
          <p>{getText(description)}</p>
        </div>
      )}

      {content && (
        <div className="content">
          <PortableText value={getBlockContent(content)} />
        </div>
      )}

      <div className="current-locale">
        <small>Current locale: {locale}</small>
      </div>
    </div>
  );
}

/**
 * Example usage:
 *
 * import { LocalizedContent } from '@/components/sanity/localized-content';
 *
 * // In your page component
 * export default function Page({ data }) {
 *   return (
 *     <LocalizedContent
 *       title={data.heroHeading}
 *       description={data.heroSubheading}
 *       content={data.content}
 *     />
 *   );
 * }
 */
