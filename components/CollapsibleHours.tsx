'use client'

import { useState } from 'react'
import { Clock, ChevronDown } from 'lucide-react'

interface BusinessHours {
  [day: string]: {
    open?: string
    close?: string
    closed?: boolean
  }
}

interface CollapsibleHoursProps {
  businessHours: BusinessHours
  isOpen: boolean
  statusText: string
}

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function CollapsibleHours({ businessHours, isOpen, statusText }: CollapsibleHoursProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const todayHours = businessHours[today]

  return (
    <article className="card-elevated rounded-2xl overflow-hidden animate-fade-up delay-200">
      {/* Clickable Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 lg:p-8 hover:bg-[hsl(var(--jungle-50))]/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-[hsl(var(--jungle-500))]" />
          <h2 className="font-display text-2xl lg:text-3xl text-[hsl(var(--jungle-800))]">
            Hours
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            isOpen
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {statusText}
          </span>

          {/* Today's hours preview when collapsed */}
          {!isExpanded && todayHours && !todayHours.closed && todayHours.open && todayHours.close && (
            <span className="hidden sm:inline text-sm text-[hsl(var(--muted-foreground))]">
              Today: {todayHours.open} - {todayHours.close}
            </span>
          )}

          {/* Chevron */}
          <ChevronDown
            className={`w-5 h-5 text-[hsl(var(--muted-foreground))] transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          isExpanded
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 lg:px-8 pb-6 lg:pb-8 pt-0 grid gap-2">
            {DAYS_ORDER.map((day) => {
              const hours = businessHours[day]
              const isToday = day === today

              return (
                <div
                  key={day}
                  className={`flex justify-between items-center py-3 px-4 rounded-xl transition-colors ${
                    isToday
                      ? 'bg-[hsl(var(--jungle-100))] border border-[hsl(var(--jungle-200))]'
                      : 'hover:bg-[hsl(var(--muted))]'
                  }`}
                >
                  <span className={`capitalize ${isToday ? 'font-semibold text-[hsl(var(--jungle-700))]' : 'text-[hsl(var(--jungle-600))]'}`}>
                    {day}
                    {isToday && <span className="ml-2 text-xs text-[hsl(var(--jungle-500))]">(Today)</span>}
                  </span>
                  <span className={`font-medium ${
                    hours?.closed
                      ? 'text-gray-400'
                      : isToday
                        ? 'text-[hsl(var(--jungle-700))]'
                        : 'text-[hsl(var(--jungle-800))]'
                  }`}>
                    {hours?.closed ? 'Closed' : hours?.open && hours?.close ? `${hours.open} - ${hours.close}` : 'Not set'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </article>
  )
}
