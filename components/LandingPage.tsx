import React from 'react'
import { ChevronRight } from 'lucide-react'
import styles from './LandingPage.module.css'

interface LandingPageProps {
  onNext: () => void
}

export default function LandingPage({ onNext }: LandingPageProps) {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#4A90E2" />
          <path d="M30 50L45 65L70 35" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1>To-Do Right</h1>
      </div>
      <button className={styles.nextButton} onClick={onNext}>
        NEXT
        <ChevronRight size={24} />
      </button>
    </div>
  )
}
