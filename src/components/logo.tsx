"use client"

import { Target } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center justify-center bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-md">
      <Target className="w-7 h-7" />
    </div>
  )
}
