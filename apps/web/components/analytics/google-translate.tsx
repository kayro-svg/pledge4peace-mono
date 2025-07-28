"use client";

import { useEffect, useRef } from "react";
import { Languages, Globe } from "lucide-react";

export function GoogleTranslate() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).googleTranslateInit = () => {
      if (document.getElementById("google_translate_element_initialized"))
        return;
      const container = containerRef.current;
      if (!container) return;

      // 1) crea el widget en HORIZONTAL (genera un <select>)
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages:
            "es,en,fr,de,it,pt,nl,pl,ru,tr,zh,ja,ko,ar,hi,bn,fa,he,id,ms,th,vi,el,ro,hu,sv,da,no,fi,uk,ca,gl,eu,sq,hr,lt,lv,sk,sl,sr,bg,cs,et,is,kk,ky,mn,ne,pa,si,ta,te,ur,uz,vi,zh-CN,zh-TW,ur-PK,af,am,ar,az,be,bg,bn,bs,ca,cs,cy,da,de,el,en,eo,es,et,eu,fa,fi,fr,gl,he,hi,hr,hu,hy,id,is,it,ja,ka,kk,km,ko,ky,lt,lv,mk,ml,mn,mr,ms,my,ne,nl,no,pa,pl,pt,ro,ru,sa,si,sk,sl,sq,sr,sv,ta,te,th,tl,tr,uk,ur,uz,vi,zh,zu",
          layout: (window as any).google.translate.TranslateElement.InlineLayout
            .HORIZONTAL,
        },
        container
      );
      container.id = "google_translate_element_initialized";

      // 2) estilos minimalistas
      if (!document.getElementById("gt-minimal-css")) {
        const style = document.createElement("style");
        style.id = "gt-minimal-css";
        style.innerHTML = `
          /* oculta logo, iconos y gadget simple */
          #google_translate_element_initialized .goog-logo-link,
          #google_translate_element_initialized .goog-te-gadget-icon,
          #google_translate_element_initialized .goog-te-gadget span,
          #google_translate_element_initialized .goog-te-gadget-simple {
            display: none !important;
          }

          /* contenedor circular */
          #google_translate_element {
            position: relative;
            width: 2.5rem; height: 2.5rem;
          }
          /* select transparente y full‑size */
          #google_translate_element_initialized select.goog-te-combo {
            position: absolute; inset: 0;
            width: 3rem; height: 3rem;
            opacity: 0; cursor: pointer;
          }
          /* icono centrado */
          #translate-toggle-icon {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
          }

          /* oculta la barra superior de Google Translate */
          .skiptranslate {
            display: none !important;
          }
          body {
            top: 0 !important;
          }
        `;
        document.head.appendChild(style);
      }

      // 3) Mueve el <select> fuera de .goog-te-gadget y elimina el gadget
      const gadget = container.querySelector(".goog-te-gadget");
      const select = container.querySelector("select.goog-te-combo");
      if (gadget && select) {
        container.appendChild(select);
        gadget.remove();
      }
    };

    // carga el script de Google Translate
    if (!document.getElementById("__google_translate_script")) {
      const s = document.createElement("script");
      s.id = "__google_translate_script";
      s.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateInit";
      s.async = true;
      document.body.appendChild(s);
    } else if ((window as any).google?.translate) {
      (window as any).googleTranslateInit();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      id="google_translate_element"
      className="fixed bottom-6 left-6 z-50 rounded-full p-1 overflow-visible"
      title="Cambiar idioma"
    >
      <Languages
        id="translate-toggle-icon"
        className="w-12 h-12 bg-white/75 backdrop-blur-sm drop-shadow-sm rounded-full p-3 shadow-lg hover:bg-white/90 transition-colors"
      />
    </div>
  );
}
