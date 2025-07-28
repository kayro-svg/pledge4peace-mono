export function injectDropinOverrides() {
  if (typeof document === "undefined") return;
  const ID = "p4p-dropin-overrides";
  if (document.getElementById(ID)) return; // ensure single injection

  const style = document.createElement("style");
  style.id = ID;
  style.textContent = `
  /* Wrapper customizations */
  .braintree-upper-container:before{
  background-color: transparent !important;
  }

  /* Payment option rows */
  .dropin-wrapper [data-braintree-id="option"] {
    border: 1px solid #86AC9D !important;
    border-radius: 6px !important;
    transition: background 0.2s, border-color 0.2s;
  }
  .dropin-wrapper [data-braintree-id="option"]:hover {
    background: #eef5f1 !important;
  }
  .dropin-wrapper [data-braintree-id="option__active"] {
    border-color: #2F4858 !important;
    background: #eef5f1 !important;
  }

  /* Card form labels */
  .dropin-wrapper [data-braintree-id="cardholder-name-label"],
  .dropin-wrapper [data-braintree-id="expiration-date-label"],
  .dropin-wrapper [data-braintree-id="number-label"] {
    font-weight: 600 !important;
    color: #2F4858 !important;
    margin-bottom: 0.25rem !important;
  }

  /* Hide main heading */
  .dropin-wrapper [data-braintree-id="choose-a-way-to-pay"] {
    display: none !important;
  }

  /* Link styling */
  .dropin-wrapper [data-braintree-id="change-payment-method"] {
    color: #2F4858 !important;
    font-weight: 500 !important;
  }

  /* ----------  CARD FIELD WRAPPERS  ---------- */
.dropin-wrapper .braintree-form__hosted-field{
  border: 1px solid #86AC9D !important;
  border-radius: 6px !important;
  padding: 0.5rem !important;
  background: #fff !important;
}

.dropin-wrapper .braintree-hosted-fields-focused {
  border-color: #2F4858 !important;
  box-shadow: 0 0 0 2px rgba(47, 72, 88, 0.2) !important;
}


/* ============ PAYMENT OPTION CARDS ============ */
.dropin-wrapper .braintree-options-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}

/* caja base */
.dropin-wrapper .braintree-option {
  display: flex !important;
  align-items: center !important;
  gap: 0.75rem !important;

  background: #fafafa !important;
  border: 2px solid transparent !important;
  border-radius: 10px !important;
  padding: 14px 16px !important;

  cursor: pointer !important;
  transition: border-color 0.15s ease, background 0.15s ease;
}

/* borde / fondo al pasar el mouse */
.dropin-wrapper .braintree-option:hover {
  background: #f1f7f4 !important;
  border-color: #86ac9d !important;
}

/* estado seleccionado */
.dropin-wrapper .braintree-option__active,
.dropin-wrapper .braintree-option__active:hover {
  background: #eef5f1 !important;
  border-color: #2f4858 !important;
}

/* logo */
.dropin-wrapper .braintree-option__logo svg {
  width: 44px !important;   /* tamaño uniforme */
  height: 27px !important;
}

/* texto etiqueta */
.dropin-wrapper .braintree-option__label {
  font-size: 0.95rem !important;
  font-weight: 500 !important;
  color: #2f4858 !important;
}

/* ============ CARD SHEET (Pay with Card) ============ */

/* outer sheet container */
.dropin-wrapper .braintree-card.braintree-sheet {
  border: 2px solid #86AC9D !important;
  border-radius: 12px !important;
  background: #ffffff !important;
  padding: 1.25rem !important; /* ~p-5 */
}

/* header */
.dropin-wrapper .braintree-card .braintree-sheet__header {
  background: #fdfdf0 !important;
  border-bottom: 1px solid #86AC9D !important;
  border-radius: 10px 10px 0 0 !important;
  padding: 1rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.dropin-wrapper .braintree-card .braintree-sheet__text {
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: #2F4858 !important;
}

.braintree-sheet__header .braintree-sheet__header-label {
padding-bottom: 0 !important;
}

.braintree-sheet__header .braintree-sheet__icons {
padding-bottom: 0 !important;
}

/* card brand icons */
.dropin-wrapper .braintree-sheet__card-icon svg {
  width: 32px !important;
  height: 20px !important;
  opacity: 0.9 !important;
}

/* generic form labels inside card sheet */
.dropin-wrapper .braintree-card .braintree-form__label {
  font-weight: 600 !important;
  color: #2F4858 !important;
  margin-bottom: 0.25rem !important;
  font-size: 0.9rem !important;
}

/* notice link */
.dropin-wrapper .braintree-form__notice-of-collection a {
  color: #2F4858 !important;
  text-decoration: underline !important;
  font-size: 0.75rem !important;
}

/* ============ PAYPAL SHEET ============ */

.dropin-wrapper .braintree-paypal.braintree-sheet {
  border: 2px solid #86AC9D !important;
  border-radius: 12px !important;
  background: #ffffff !important;
  padding: 1.25rem !important; /* ~p-5 */
}

.dropin-wrapper .braintree-paypal .braintree-sheet__header {
  background: #fdfdf0 !important;
  border-bottom: 1px solid #86AC9D !important;
  border-radius: 10px 10px 0 0 !important;
  padding: 1rem !important;
  display: flex !important;
  align-items: center !important;
}

.dropin-wrapper .braintree-paypal .braintree-sheet__label {
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: #2F4858 !important;
  margin-left: 0.5rem !important;
}

/* PayPal button wrapper */
.dropin-wrapper .braintree-sheet__button--paypal {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  padding-top: 1rem !important;
}

/* Ensure PayPal smart button fills width */
.dropin-wrapper .braintree-sheet__button--paypal .paypal-button {
  width: 100% !important;
  min-width: 200px !important;
}

/* ----------  FIRST & LAST OPTION COLORS  ---------- */
.dropin-wrapper .braintree-option:first-child {
  padding: 1rem !important; /* p-4 */
  background: #ecfdf5 !important; /* green-50 */
  border: 2px solid #bbf7d0 !important; /* green-200 */
}

.dropin-wrapper .braintree-option:last-child {
  padding: 1rem !important; /* p-4 */
  background: #eff6ff !important; /* blue-50 */
  border: 2px solid #bfdbfe !important; /* blue-200 */
}

/* oculta el div de mensaje disabled (no lo usas) */
.dropin-wrapper .braintree-option__disabled-message {
  display: none !important;
}

/* "Choose another way" large button */
.dropin-wrapper .braintree-large-button {
  width: 100% !important; /* w-full */
  display: inline-flex !important; /* inline-flex */
  align-items: center !important; /* items-center */
  justify-content: center !important; /* justify-center */
  border-radius: 9999px !important; /* rounded-full */
  padding: 0.75rem 1.5rem !important; /* py-3 px-6 */
  font-size: 0.875rem !important; /* text-sm */
  font-weight: 500 !important; /* font-medium */
  background-color: #548281 !important; /* bg-[#548281] */
  color: #ffffff !important; /* text-white */
  transition: background-color 0.3s ease-in-out !important; /* transition-colors duration-300 ease-in-out */
  outline: none !important; /* focus:outline-none */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important; /* shadow-sm */
}

.dropin-wrapper .braintree-large-button:hover {
  background-color: #2f4858 !important; /* hover:bg-[#2f4858] */
}

/* =====  3D Secure / CardinalCommerce modal  ===== */

#Cardinal-Modal,
.Cardinal-Modal {
 pointer-events: auto;
}

/* Cuando el modal de Cardinal existe… */
body:has(#Cardinal-Modal) .radix-dialog-overlay {
  z-index: 40 !important;        /* lo mandamos al fondo */
}

body:has(#Cardinal-Modal) .radix-dialog-content {
  pointer-events: none !important; /* y anulamos los clics */
}
  `;

  document.head.appendChild(style);
}
