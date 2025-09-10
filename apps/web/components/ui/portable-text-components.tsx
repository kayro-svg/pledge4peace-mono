import Image from "next/image";
import { PortableTextComponents } from "@portabletext/react";
import { PortableText } from "@portabletext/react";
import BrevoFormIframe from "@/components/ui/brevo-form-iframe";
import { getSanityImageUrl } from "@/lib/sanity/image-helpers";

// Iframe para formularios de Brevo servidos desde /embeds/brevo/[id]
const BrevoFormBlock = ({ value }: any) => {
  const id = value?.slug || value?._id || value?._ref;
  if (!id) return null;
  const height = value?.height || 1100;
  return <BrevoFormIframe id={id} height={height} />;
};

// Componente para renderizar imágenes inline con opciones avanzadas
const InlineImageComponent = ({ value }: any) => {
  if (!value?.asset?.url) {
    return null;
  }

  const alignment = value.alignment || "center";
  const size = value.size || "large";

  // Clases de alineación
  const alignmentClasses = {
    left: "mx-0 mr-auto",
    center: "mx-auto",
    right: "mx-0 ml-auto",
    full: "mx-0 w-full",
  };

  // Clases de tamaño
  const sizeClasses = {
    small: "max-w-xs",
    medium: "max-w-md",
    large: "max-w-2xl",
    full: "w-full",
  };

  const figureClasses = `my-8 ${alignmentClasses[alignment as keyof typeof alignmentClasses]} ${sizeClasses[size as keyof typeof sizeClasses]}`;

  return (
    <figure className={figureClasses}>
      <div className="relative w-full h-auto">
        <Image
          src={getSanityImageUrl(value.asset.url, 800)}
          alt={value.alt || "Article image"}
          width={800}
          height={600}
          className="w-full h-auto rounded-lg shadow-lg"
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 90vw, 800px"
        />
      </div>
      {value.caption && (
        <figcaption className="text-center text-sm text-gray-600 italic mt-2">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
};

// Componente para video embeds
const VideoEmbedComponent = ({ value }: any) => {
  if (!value?.url) return null;

  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("/").pop()?.split("?")[0]
        : url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Vimeo
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop()?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  return (
    <figure className="my-8">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={getEmbedUrl(value.url)}
          title={value.title || "Video"}
          className="w-full h-full"
          allowFullScreen
          frameBorder="0"
        />
      </div>
      {(value.title || value.caption) && (
        <figcaption className="text-center text-sm text-gray-600 italic mt-2">
          {value.title && <div className="font-medium">{value.title}</div>}
          {value.caption && <div>{value.caption}</div>}
        </figcaption>
      )}
    </figure>
  );
};

// Componente para callout boxes
const CalloutComponent = ({ value }: any) => {
  const typeStyles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    note: "bg-gray-50 border-gray-200 text-gray-800",
  };

  const iconMap = {
    info: "💡",
    warning: "⚠️",
    success: "✅",
    error: "❌",
    note: "📝",
  };

  const type = value.type || "info";
  const styleClass = typeStyles[type as keyof typeof typeStyles];
  const icon = iconMap[type as keyof typeof iconMap];

  return (
    <div className={`my-6 p-4 border rounded-lg ${styleClass}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{icon}</span>
        <div className="flex-1">
          {value.title && <h4 className="font-semibold mb-2">{value.title}</h4>}
          {value.content && (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {value.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para separadores
const DividerComponent = ({ value }: any) => {
  const style = value.style || "simple";

  const dividerStyles = {
    simple: <hr className="my-8 border-gray-300" />,
    thick: <hr className="my-8 border-2 border-gray-400" />,
    dotted: <hr className="my-8 border-dotted border-2 border-gray-300" />,
    stars: (
      <div className="my-8 text-center text-gray-400">
        <span className="text-2xl">✦ ✦ ✦</span>
      </div>
    ),
  };

  return dividerStyles[style as keyof typeof dividerStyles];
};

// Componente para columnas
const ColumnsComponent = ({ value }: any) => {
  return (
    <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="prose prose-sm max-w-none">
        {value.leftColumn && (
          <PortableText
            value={value.leftColumn}
            components={portableTextComponents}
          />
        )}
      </div>
      <div className="prose prose-sm max-w-none">
        {value.rightColumn && (
          <PortableText
            value={value.rightColumn}
            components={portableTextComponents}
          />
        )}
      </div>
    </div>
  );
};

// Configuración de componentes para PortableText
export const portableTextComponents: PortableTextComponents = {
  types: {
    // Renderizador para imágenes inline
    inlineImage: InlineImageComponent,
    image: InlineImageComponent, // También manejamos el tipo genérico 'image'
    videoEmbed: VideoEmbedComponent,
    callout: CalloutComponent,
    divider: DividerComponent,
    columns: ColumnsComponent,
    brevoForm: BrevoFormBlock,
    brevoFormRef: BrevoFormBlock,
  },
  block: {
    // Estilos personalizados para los diferentes tipos de bloque
    normal: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
    h1: ({ children }) => (
      <h2 className="text-3xl font-bold mb-6 mt-8 text-gray-900">{children}</h2>
    ),
    h2: ({ children }) => (
      <h3 className="text-2xl font-semibold mb-4 mt-6 text-gray-900">
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h4 className="text-xl font-semibold mb-3 mt-5 text-gray-900">
        {children}
      </h4>
    ),
    h4: ({ children }) => (
      <h5 className="text-lg font-medium mb-3 mt-4 text-gray-900">
        {children}
      </h5>
    ),
    h5: ({ children }) => (
      <h6 className="text-base font-medium mb-2 mt-3 text-gray-900">
        {children}
      </h6>
    ),
    h6: ({ children }) => (
      <p className="text-sm font-medium mb-2 mt-3 text-gray-700">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#548281] pl-6 my-6 italic text-gray-700 bg-gray-50 py-4 rounded-r-lg">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto">
        <code className="text-sm font-mono">{children}</code>
      </pre>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside ml-6 mb-4 space-y-2">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside ml-6 mb-4 space-y-2">
        {children}
      </ol>
    ),
    checklist: ({ children }) => (
      <ul className="list-none ml-0 mb-4 space-y-2">{children}</ul>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-7">{children}</li>,
    number: ({ children }) => <li className="leading-7">{children}</li>,
    checklist: ({ children }) => (
      <li className="flex items-start gap-2 leading-7">
        <span className="text-green-600 mt-1">✓</span>
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    // Decoradores de texto
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    underline: ({ children }) => <u className="underline">{children}</u>,
    "strike-through": ({ children }) => (
      <s className="line-through">{children}</s>
    ),
    highlight: ({ children }) => (
      <mark className="bg-yellow-200 px-1 rounded">{children}</mark>
    ),

    // Alineaciones de texto
    alignLeft: ({ children }) => (
      <span className="block text-left">{children}</span>
    ),
    alignCenter: ({ children }) => (
      <span className="block text-center">{children}</span>
    ),
    alignRight: ({ children }) => (
      <span className="block text-right">{children}</span>
    ),
    alignJustify: ({ children }) => (
      <span className="block text-justify">{children}</span>
    ),

    // Colores de texto
    color: ({ children, value }) => {
      const colorClasses = {
        red: "text-red-600",
        blue: "text-blue-600",
        green: "text-green-600",
        orange: "text-orange-600",
        purple: "text-purple-600",
        teal: "text-teal-600",
        gray: "text-gray-600",
      };

      const colorClass =
        colorClasses[value?.value as keyof typeof colorClasses] ||
        "text-gray-900";

      return <span className={colorClass}>{children}</span>;
    },

    // Enlaces
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.blank ? "_blank" : "_self"}
        rel={value?.blank ? "noopener noreferrer" : undefined}
        className="text-[#548281] hover:text-[#2F4858] underline transition-colors"
      >
        {children}
      </a>
    ),
  },
};
