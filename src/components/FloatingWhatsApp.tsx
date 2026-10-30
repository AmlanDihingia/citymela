'use client'

import React, { useState } from 'react'

interface FloatingWhatsAppProps {
  phoneNumber?: string
  message?: string
}

export default function FloatingWhatsApp({
  phoneNumber = '919181051445',
  message = 'Hi City Mela, I would like to know more about the festivals!',
}: FloatingWhatsAppProps) {
  const [isHovered, setIsHovered] = useState(false)

  const cleanNumber = phoneNumber.replace(/\D/g, '')
  const encodedMsg = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`

  return (
    <aside
      aria-label="Direct WhatsApp Contact"
      style={{
        position: 'fixed',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        right: 'max(16px, env(safe-area-inset-right))',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {/* Tooltip / Label pill on hover (desktop only) */}
      <span
        style={{
          background: '#1A0F0C',
          color: '#FFF7EE',
          padding: '6px 12px',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "'Bricolage Grotesque', sans-serif",
          boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
          border: '1px solid #3a2e2a',
          whiteSpace: 'nowrap',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateX(0)' : 'translateX(10px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          pointerEvents: 'none',
        }}
      >
        Chat on WhatsApp
      </span>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with City Mela on WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          pointerEvents: 'auto',
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#25D366',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(37, 211, 102, 0.45), 0 2px 8px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease, box-shadow 0.2s ease',
          transform: isHovered ? 'scale(1.08) translateY(-2px)' : 'scale(1) translateY(0)',
          textDecoration: 'none',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.176 8.176 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.21 8.21 0 0 1-1.26-4.47c0-4.54 3.7-8.25 8.24-8.25m4.77 11.5c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.19-.56.06-.26-.13-1.1-.41-2.09-1.3-.77-.69-1.29-1.54-1.44-1.8-.15-.26-.02-.4.11-.53.12-.11.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.79-1.92-.21-.51-.42-.44-.58-.45l-.49-.01c-.17 0-.45.06-.69.32-.24.26-.92.9-.92 2.2 0 1.3 1.02 2.56 1.16 2.75.14.19 2.01 3.07 4.87 4.31.68.3 1.21.47 1.62.6.68.22 1.3.19 1.79.12.55-.08 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.18-.5-.31z" />
        </svg>
      </a>
    </aside>
  )
}
