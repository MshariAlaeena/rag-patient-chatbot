"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Lightbulb, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CopingStrategy {
  id: string
  title: string
  description: string
  duration: string
  effectiveness: number
}

export function CravingLogger() {
  const [isOpen, setIsOpen] = useState(false)
  const [intensity, setIntensity] = useState([5])
  const [notes, setNotes] = useState("")
  const [showStrategy, setShowStrategy] = useState(false)
  const { toast } = useToast()
  const [selectedStrategy, setSelectedStrategy] = useState<CopingStrategy | null>(null)

  const copingStrategies: CopingStrategy[] = [
    {
      id: "1",
      title: "Deep Breathing Exercise",
      description: "Take slow, deep breaths for 2-3 minutes. Breathe in for 4 counts, hold for 4, exhale for 6.",
      duration: "3-5 minutes",
      effectiveness: 85,
    },
    {
      id: "2",
      title: "Physical Activity",
      description: "Do 10 jumping jacks or take a brisk 2-minute walk to redirect your energy.",
      duration: "2-5 minutes",
      effectiveness: 78,
    },
    {
      id: "3",
      title: "5-4-3-2-1 Grounding",
      description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
      duration: "2-3 minutes",
      effectiveness: 82,
    },
  ]

  const getRandomStrategy = () => {
    return copingStrategies[Math.floor(Math.random() * copingStrategies.length)]
  }

  const handleSubmit = () => {
    const strategy = getRandomStrategy()
    setSelectedStrategy(strategy) // Store the selected strategy
    setShowStrategy(true)

    toast({
      title: "Craving logged successfully",
      description: `Intensity: ${intensity[0]}/10. Here's a coping strategy to help.`,
    })
  }

  const handleStrategyComplete = () => {
    setIsOpen(false)
    setShowStrategy(false)
    setSelectedStrategy(null) // Clear the selected strategy
    setIntensity([5])
    setNotes("")

    toast({
      title: "Great job! 🎉",
      description: "You've successfully managed your craving. Keep up the excellent work!",
    })
  }

  const getIntensityColor = (value: number) => {
    if (value <= 3) return "text-green-600"
    if (value <= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getIntensityLabel = (value: number) => {
    if (value <= 3) return "Mild"
    if (value <= 6) return "Moderate"
    return "Intense"
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col items-center justify-center h-24 border-2 bg-transparent">
          <AlertCircle className="w-6 h-6 mb-2 text-orange-500" />
          <span>Log Craving</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Log Your Craving
          </DialogTitle>
        </DialogHeader>

        {!showStrategy ? (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">How intense is your craving?</Label>
              <div className="mt-4 space-y-4">
                <Slider value={intensity} onValueChange={setIntensity} max={10} min={1} step={1} className="w-full" />
                <div className="flex justify-between text-sm text-slate-600">
                  <span>1 - Very mild</span>
                  <span className={`font-medium ${getIntensityColor(intensity[0])}`}>
                    {intensity[0]}/10 - {getIntensityLabel(intensity[0])}
                  </span>
                  <span>10 - Overwhelming</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">What triggered this craving? (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., after coffee, stress at work, seeing someone smoke..."
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                <Lightbulb className="w-4 h-4 mr-2" />
                Get Coping Strategy
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedStrategy && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">{selectedStrategy.title}</h3>
                    <p className="text-sm text-blue-700 mb-3">{selectedStrategy.description}</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {selectedStrategy.duration}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {selectedStrategy.effectiveness}% effective
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleStrategyComplete} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />I tried this strategy
              </Button>
              <Button variant="outline" onClick={() => setShowStrategy(false)}>
                Get different tip
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
