"use client"

import { useEffect } from "react"

type KeyHandler = (e: KeyboardEvent) => void

export function useHotkeys(keys: string, callback: KeyHandler) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Parse the key combination
      const keyCombination = keys.toLowerCase().split("+")
      const mainKey = keyCombination[keyCombination.length - 1]

      // Check if the pressed key matches the main key
      if (e.key.toLowerCase() !== mainKey) return

      // Check if required modifier keys are pressed
      const needCtrl = keyCombination.includes("ctrl")
      const needMeta = keyCombination.includes("cmd") || keyCombination.includes("meta")
      const needShift = keyCombination.includes("shift")
      const needAlt = keyCombination.includes("alt")

      if (
        (needCtrl && !e.ctrlKey) ||
        (needMeta && !e.metaKey) ||
        (needShift && !e.shiftKey) ||
        (needAlt && !e.altKey)
      ) {
        return
      }

      // If all conditions are met, call the callback
      callback(e)
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [keys, callback])
}
