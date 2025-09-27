import React from 'react'
import Link from 'next/link'

export default function PolicyPrivacyPop() {
  return (
    <div className='absolute hidden group-hover:flex flex-col gap-3 w-[9rem] text-gray-800 text-sm bg-white/90 dark:bg-transparent backdrop-blur-sm p-3 rounded-sm shadow-md top-full mt-2 dark:text-gray-200'>
      <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
      <Link href="/policy" className="hover:underline">Terms</Link>
    </div>
  )
}
