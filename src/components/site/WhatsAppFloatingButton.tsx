import { businessConfig } from "@/lib/business.config";

/**
 * A single, tasteful floating WhatsApp affordance — not a giant banner,
 * not repeated on every section. Bottom-right, out of the way of content
 * and of the mobile checkout flow's primary actions.
 */
export function WhatsAppFloatingButton() {
  return (
    <a
      href={`https://wa.me/${businessConfig.contact.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="no-print fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105 hover:bg-whatsapp-dark"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.38 1.26 4.8L2 22l5.42-1.42a9.87 9.87 0 0 0 4.62 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.12-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.56-1.17-2.97 0-1.42.74-2.11 1-2.4.26-.29.58-.36.77-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.14.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.93.29.14.48.21.55.33.07.12.07.7-.17 1.38Z" />
      </svg>
    </a>
  );
}
