"use client";

import { useState } from "react";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Check, // traemos el icono de check de lucide-react
} from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  // Fallback para navegadores que no soporten navigator.clipboard.writeText
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Lo colocamos fuera de la vista
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback: Ocurrió un error al copiar el texto", err);
    }

    document.body.removeChild(textArea);
  };

  const copyToClipboard = async () => {
    // Primero intento la API moderna (solo funciona en contextos seguros)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        // Éxito: marco como 'copiado'
        setCopied(true);
        // Después de 2 segundos, lo reseteo a false
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (err) {
        console.warn("navigator.clipboard falló, usando fallback:", err);
      }
    }
    // Si llego aquí, uso el fallback
    fallbackCopyTextToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4">
      <span className="flex items-center text-gray-600">
        <Share2 className="w-5 h-5 mr-2" />
        Share this article:
      </span>

      <div className="flex gap-3">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-5 h-5 text-[#1877F2]" />
        </a>

        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-5 h-5 text-[#1DA1F2]" />
        </a>

        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-5 h-5 text-[#0A66C2]" />
        </a>

        <button
          onClick={copyToClipboard}
          className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label={copied ? "Link copied" : "Copy link"}
        >
          {/* Si copied es true mostramos Check, sino LinkIcon */}
          {copied ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <LinkIcon className="w-5 h-5 text-gray-600" />
          )}
          {/*
            Opcional: mostrar un pequeño texto “¡Copiado!” al lado del botón.
            Lo posicionamos con absolute para que no cambie el layout.
          */}
          {copied && (
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
              Copied!
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// "use client";

// import {
//   Share2,
//   Facebook,
//   Twitter,
//   Linkedin,
//   Link as LinkIcon,
// } from "lucide-react";

// interface ShareButtonsProps {
//   url: string;
//   title: string;
// }

// export default function ShareButtons({ url, title }: ShareButtonsProps) {
//   const encodedUrl = encodeURIComponent(url);
//   const encodedTitle = encodeURIComponent(title);

//   const shareLinks = {
//     facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
//     twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
//     linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
//   };

//   const copyToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(url);
//       // You could add a toast notification here
//     } catch (err) {
//       console.error("Failed to copy:", err);
//     }
//   };

//   return (
//     <div className="flex items-center gap-4">
//       <span className="flex items-center text-gray-600">
//         <Share2 className="w-5 h-5 mr-2" />
//         Share this article:
//       </span>

//       <div className="flex gap-3">
//         <a
//           href={shareLinks.facebook}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
//           aria-label="Share on Facebook"
//         >
//           <Facebook className="w-5 h-5 text-[#1877F2]" />
//         </a>

//         <a
//           href={shareLinks.twitter}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
//           aria-label="Share on Twitter"
//         >
//           <Twitter className="w-5 h-5 text-[#1DA1F2]" />
//         </a>

//         <a
//           href={shareLinks.linkedin}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
//           aria-label="Share on LinkedIn"
//         >
//           <Linkedin className="w-5 h-5 text-[#0A66C2]" />
//         </a>

//         <button
//           onClick={copyToClipboard}
//           className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
//           aria-label="Copy link"
//         >
//           <LinkIcon className="w-5 h-5 text-gray-600" />
//         </button>
//       </div>
//     </div>
//   );
// }
