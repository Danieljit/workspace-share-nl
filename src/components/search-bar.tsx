"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  initialValue?: string
}

export function SearchBar({ onSearch, placeholder, initialValue = "" }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Clear the debounce timer when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Only trigger search after user stops typing for 800ms
    // and only if there's actually a search value
    if (value.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        onSearch(value)
      }, 800)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (inputValue.trim()) {
        onSearch(inputValue)
      }
      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-6 w-6 text-gray-900" />
      </div>
      <Input
        type="search"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="pl-12 py-7 bg-white text-gray-900 placeholder:text-gray-700 shadow-lg text-lg rounded-2xl"
      />
    </div>
  )
}
