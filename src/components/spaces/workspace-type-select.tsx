"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface WorkspaceTypeSelectProps {
  onSelect: (type: string) => void
  selectedType?: string
}

const workspaceTypes = [
  { id: "single-desk", label: "Single Desk" },
  { id: "private-office", label: "Private Office" },
  { id: "meeting-room", label: "Meeting Room" },
  { id: "co-working", label: "Co-Working Space" },
]

export function WorkspaceTypeSelect({ onSelect, selectedType }: WorkspaceTypeSelectProps) {
  const [open, setOpen] = useState(false)
  const selected = workspaceTypes.find(type => type.id === selectedType)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between py-7 bg-white text-gray-900 shadow-lg text-lg rounded-2xl"
        >
          {selected?.label || "Workspace Type"}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <div className="max-h-[300px] overflow-auto">
          {workspaceTypes.map((type) => (
            <div
              key={type.id}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-4 py-3 text-lg outline-none hover:bg-muted",
                selectedType === type.id && "bg-muted"
              )}
              onClick={() => {
                onSelect(type.id)
                setOpen(false)
              }}
            >
              <span>{type.label}</span>
              {selectedType === type.id && (
                <Check className="ml-auto h-5 w-5" />
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
