"use client";

import { useEffect, useRef } from "react";
import { Languages } from "lucide-react";

export function GoogleTranslate() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Función global para que el script externo llame a la inicialización
    (window as any).googleTranslateInit = () => {
      if (document.getElementById("google_translate_element_initialized"))
        return;

      const container = containerRef.current;
      if (!container) return;

      // Crea el widget <select> de Google Translate
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages:
            "es,en,fr,de,it,pt,nl,pl,ru,tr,zh,ja,ko,ar,hi,bn,fa,he,id,ms,th,vi,el,ro,hu,sv,da,no,fi,uk,ca,gl,eu,sq,hr,lt,lv,sk,sl,sr,bg,cs,et,is,kk,ky,mn,ne,pa,si,ta,te,ur,uz,zh-CN,zh-TW,af,am,az,be,bs,cy,eo,km,ka,ml,mr,my,sa,tl,zu",
          layout: (window as any).google.translate.TranslateElement.InlineLayout
            .HORIZONTAL,
        },
        container
      );

      container.id = "google_translate_element_initialized";

      // Inyecta estilos minimalistas una sola vez
      if (!document.getElementById("gt-minimal-css")) {
        const style = document.createElement("style");
        style.id = "gt-minimal-css";
        style.textContent = `
          /* Oculta logo, iconos y textos innecesarios del gadget */
          #google_translate_element_initialized .goog-logo-link,
          #google_translate_element_initialized .goog-te-gadget-icon,
          #google_translate_element_initialized .goog-te-gadget span,
          #google_translate_element_initialized .goog-te-gadget-simple {
            display: none !important;
          }

          /* Contenedor circular */
          #google_translate_element {
            position: relative;
            width: 2.5rem;
            height: 2.5rem;
          }
          /* Select transparente que ocupa todo el círculo */
          #google_translate_element_initialized select.goog-te-combo {
            position: absolute;
            inset: 0;
            width: 3rem;
            height: 3rem;
            opacity: 0;
            cursor: pointer;
          }
          /* Icono centrado */
          #translate-toggle-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
          }

          /* Oculta la barra superior inyectada por Google Translate */
          .goog-te-banner-frame.skiptranslate,
          .skiptranslate {
            display: none !important;
          }
          body {
            top: 0 !important;
          }
        `;
        document.head.appendChild(style);
      }
    };

    // Carga el script de Google Translate si no está presente
    if (!document.getElementById("__google_translate_script")) {
      const s = document.createElement("script");
      s.id = "__google_translate_script";
      s.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateInit";
      s.async = true;
      document.body.appendChild(s);
    } else if ((window as any).google?.translate) {
      // Script ya cargado y API lista → inicializar inmediatamente
      (window as any).googleTranslateInit();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      id="google_translate_element"
      className="notranslate fixed bottom-6 left-6 z-50 rounded-full p-1 overflow-visible"
      title="Change language"
    >
      <Languages
        id="translate-toggle-icon"
        className="w-12 h-12 bg-white/75 backdrop-blur-sm drop-shadow-sm rounded-full p-3 shadow-lg hover:bg-white/90 transition-colors"
      />
    </div>
  );
}
