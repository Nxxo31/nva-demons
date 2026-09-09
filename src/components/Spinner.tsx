import { useState } from 'react'

export default function Spinner() {
  return (
    <div className="flex h-12 w-12 items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
    </div>
  )
}