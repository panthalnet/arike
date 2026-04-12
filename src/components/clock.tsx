'use client'

import { useState, useEffect } from 'react'

/**
 * Clock component displaying current date and time
 * Mobile-first design with responsive layout
 * Meets FR-001 requirements: date/time in top-left, 14px minimum font size
 */
export function Clock() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Prevent hydration mismatch by showing placeholder until mounted
  if (!mounted) {
    return (
      <div 
        data-testid="clock"
        className="flex flex-col items-start gap-1"
        aria-live="off"
      >
        <div 
          data-testid="clock-date"
          className="text-sm md:text-base text-muted-foreground"
        >
          Loading...
        </div>
        <div 
          data-testid="clock-time"
          className="text-2xl md:text-3xl font-semibold"
        >
          --:--
        </div>
      </div>
    )
  }

  // Format date: "Monday, January 1, 2026"
  const dateStr = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Format time: "12:34 PM" or "23:45" (based on user's locale)
  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div 
      data-testid="clock"
      className="flex flex-col items-start gap-1"
      aria-live="off"
      aria-atomic="true"
    >
      <time 
        data-testid="clock-date"
        dateTime={currentTime.toISOString()}
        className="text-sm md:text-base text-muted-foreground font-medium"
        style={{ fontSize: 'max(14px, 0.875rem)' }} // Ensure minimum 14px per spec
      >
        {dateStr}
      </time>
      <time 
        data-testid="clock-time"
        dateTime={currentTime.toISOString()}
        className="text-2xl md:text-3xl font-semibold tabular-nums tracking-tight"
      >
        {timeStr}
      </time>
    </div>
  )
}
