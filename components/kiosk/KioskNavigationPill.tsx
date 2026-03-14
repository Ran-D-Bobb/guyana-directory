'use client'

interface KioskNavigationPillProps {
  activeSection: string
  onNavigate: (section: string) => void
}

const SECTIONS = [
  { id: 'experiences', label: 'Experiences', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'categories', label: 'Categories', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
]

/**
 * Floating bottom navigation pill.
 * Glass background, centered, with Experiences | Events | Categories.
 */
export default function KioskNavigationPill({ activeSection, onNavigate }: KioskNavigationPillProps) {
  return (
    <nav className="kiosk-nav-pill" aria-label="Kiosk navigation">
      {SECTIONS.map(section => {
        const isActive = activeSection === section.id
        return (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className={`kiosk-nav-pill-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={section.id === 'experiences' && isActive ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={section.icon} />
            </svg>
            {section.label}
          </button>
        )
      })}
    </nav>
  )
}
