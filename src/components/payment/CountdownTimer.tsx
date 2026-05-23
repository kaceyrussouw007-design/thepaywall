'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface CountdownTimerProps {
  durationSeconds: number
  onExpire: () => void
}

export function CountdownTimer({ durationSeconds, onExpire }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds)

  useEffect(() => {
    if (remaining <= 0) {
      onExpire()
      return
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [remaining, onExpire])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const progress = (remaining / durationSeconds) * 100
  const isUrgent = remaining < 120

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-1.5 text-sm font-medium ${isUrgent ? 'text-amber-400' : 'text-muted-foreground'}`}>
        <Clock className="w-3.5 h-3.5" />
        <span>
          {minutes}:{seconds.toString().padStart(2, '0')} remaining
        </span>
      </div>
      <Progress
        value={progress}
        className={`h-1.5 ${isUrgent ? '[&>div]:bg-amber-500' : '[&>div]:bg-violet-600'}`}
      />
    </div>
  )
}
