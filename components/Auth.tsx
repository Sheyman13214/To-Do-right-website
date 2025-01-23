"use client"

import type React from "react"
import { useState } from "react"
import styles from "./Auth.module.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AuthProps {
  onAuthenticate: (user: { name: string; phone: string; password: string; mothersMaidenName?: string }) => void
  onForgotPassword: (phone: string) => void
}

export default function Auth({ onAuthenticate, onForgotPassword }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [mothersMaidenName, setMothersMaidenName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp) {
      if (!name || !phone || !password || !mothersMaidenName) {
        alert("Please fill in all fields")
        return
      }
      onAuthenticate({ name, phone, password, mothersMaidenName })
    } else {
      if (step === 1) {
        if (!phone) {
          alert("Please enter your phone number")
          return
        }
        setStep(2)
      } else {
        if (!password) {
          alert("Please enter your password")
          return
        }
        onAuthenticate({ name: "", phone, password })
      }
    }
  }

  const handleForgotPassword = () => {
    if (!phone) {
      alert("Please enter your phone number")
      return
    }
    onForgotPassword(phone)
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.logo}>
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#4A90E2" />
          <path d="M30 50L45 65L70 35" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1>To-Do Right</h1>
      </div>
      <h2 className={styles.welcome}>WELCOME!</h2>
      <h3>{isSignUp ? "Sign Up" : "Sign In"}</h3>
      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className={styles.input}
          />
        )}
        {(isSignUp || (!isSignUp && step === 1)) && (
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            className={styles.input}
          />
        )}
        {(isSignUp || (!isSignUp && step === 2)) && (
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className={styles.input}
          />
        )}
        {isSignUp && (
          <Input
            type="text"
            value={mothersMaidenName}
            onChange={(e) => setMothersMaidenName(e.target.value)}
            placeholder="Enter your mother's maiden name"
            className={styles.input}
          />
        )}
        <Button type="submit" className={styles.button}>
          {isSignUp ? "Sign Up" : step === 1 ? "Next" : "Sign In"}
        </Button>
      </form>
      {!isSignUp && step === 2 && (
        <Button onClick={() => setStep(1)} className={styles.backButton}>
          Back
        </Button>
      )}
      {!isSignUp && (
        <Button onClick={handleForgotPassword} className={styles.forgotPasswordButton}>
          Forgot Password?
        </Button>
      )}
      <p>
        {isSignUp ? "Already have an account?" : "Don't have an account?"}
        <Button
          onClick={() => {
            setIsSignUp(!isSignUp)
            setStep(1)
          }}
          className={styles.toggleButton}
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </Button>
      </p>
    </div>
  )
}
