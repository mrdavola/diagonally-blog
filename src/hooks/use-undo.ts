import { useState, useCallback } from "react"

const MAX_HISTORY = 50

interface UndoState<T> {
  past: T[]
  present: T
  future: T[]
}

export function useUndo<T>(initialState: T) {
  const [history, setHistory] = useState<UndoState<T>>({
    past: [],
    present: initialState,
    future: [],
  })

  const setState = useCallback((newPresent: T | ((prev: T) => T)) => {
    setHistory((prev) => {
      const resolved =
        typeof newPresent === "function"
          ? (newPresent as (p: T) => T)(prev.present)
          : newPresent
      const newPast = [...prev.past, prev.present].slice(-MAX_HISTORY)
      return {
        past: newPast,
        present: resolved,
        future: [],
      }
    })
  }, [])

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev
      const newPast = prev.past.slice(0, -1)
      const newPresent = prev.past[prev.past.length - 1]
      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev
      const [newPresent, ...newFuture] = prev.future
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      }
    })
  }, [])

  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    })
  }, [])

  return {
    state: history.present,
    setState,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
