"use client"

import { MainLayout } from "@/components/main-layout"
import { useEffect } from "react"

export default function Home() {
  // Fix for Safari/iOS issues with vh units
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
    }

    setVh()
    window.addEventListener("resize", setVh)

    return () => window.removeEventListener("resize", setVh)
  }, [])

  return <MainLayout />
}
