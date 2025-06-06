"use client"

import { useState } from "react"
import { DashboardHeader } from "./components/dashboard-header"
import { SidebarContent } from "./components/sidebar-content"
import { MainVisualization } from "./components/main-visualization"

import type {
  TargetProperties,
  PropertyWeights,
  SimilarityResult,
  OptimizationResult,
  OptimizationConfig,
  AirfoilData,
  AIGenerationConfig,
  AIGenerationResult,
} from "./types/airfoil"

const API_BASE_URL = "http://localhost:5000" // Flask default port

export default function AirfoilDashboard() {
  const [isSearching, setIsSearching] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<string>("")
  const [aiGenerationResult, setAiGenerationResult] = useState<AIGenerationResult | null>(null)
  const [plotMode, setPlotMode] = useState<"preview" | "optimization" | "ai_generation">("preview")
  const [similarityResults, setSimilarityResults] = useState<SimilarityResult[]>(() => {
    // Load saved results from localStorage on component mount
    if (typeof window !== 'undefined') {
      const savedResults = localStorage.getItem('similarityResults')
      return savedResults ? JSON.parse(savedResults) : []
    }
    return []
  })
  const [selectedAirfoil, setSelectedAirfoil] = useState<SimilarityResult | null>(null)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | undefined>(undefined)
  const [optimizationProgress, setOptimizationProgress] = useState<{
    currentIteration: number
    maxIterations: number
    bestFitness: number
  } | undefined>(undefined)

  const handleSimilaritySearch = async (targets: TargetProperties, weights: PropertyWeights) => {
    setIsSearching(true)
    setOptimizationResult(undefined)
    setSelectedAirfoil(null)
    setAiGenerationResult(null)
    setPlotMode("preview")

    try {
      const response = await fetch(`${API_BASE_URL}/api/similarity-search`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          targets: {
            cl: targets.cl,
            cd: targets.cd,
            cm: targets.cm,
            reynolds_number: targets.reynolds_number,
            angle_of_attack: targets.angle_of_attack,
            cl_cd_ratio: targets.cl_cd_ratio
          },
          weights: {
            cl: weights.cl,
            cd: weights.cd,
            cm: weights.cm,
            reynolds_number: weights.reynolds_number,
            angle_of_attack: weights.angle_of_attack,
            cl_cd_ratio: weights.cl_cd_ratio
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      // Transform the data to match our SimilarityResult interface
      const transformedResults = data.map((result: any) => ({
        airfoil: {
          airfoil_name: result.airfoil_name,
          airfoil_file: result.airfoil_file || "",
          reynolds_number: result.reynolds_number || 0,
          angle_of_attack: result.angle_of_attack || 0,
          cl: result.cl || 0,
          cd: result.cd || 0,
          cm: result.cm || 0,
          cl_cd_ratio: result.cl_cd_ratio || 0,
          optimized_cl: result.optimized_cl || 0,
          optimized_cd: result.optimized_cd || 0,
          optimized_cm: result.optimized_cm || 0,
          optimized_cl_cd_ratio: result.optimized_cl_cd_ratio || 0,
          geometry: result.geometry || [],
          airfoil_id: result.airfoil_id || "",
          similarity: result.similarity || 0
        },
        similarity_score: result.similarity || 0
      }))

      setSimilarityResults(transformedResults)
      
      // Save results to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('similarityResults', JSON.stringify(transformedResults))
      }
    } catch (error) {
      console.error("Similarity search failed:", error)
      setSimilarityResults([])
      // Clear localStorage on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('similarityResults')
      }
    } finally {
      setIsSearching(false)
    }
  }

  
  const handlePlotAirfoil = (airfoil: SimilarityResult) => {
    setSelectedAirfoil(airfoil)
    setOptimizationResult(undefined)
    setAiGenerationResult(null)
    setPlotMode("preview")
  }

  const handleOptimization = async (airfoil: SimilarityResult, config: OptimizationConfig) => {
    setSelectedAirfoil(airfoil)
    setIsOptimizing(true)
    setOptimizationResult(undefined)
    setAiGenerationResult(null)
    setPlotMode("optimization")
    try {
      const response = await fetch(`${API_BASE_URL}/api/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          airfoil: {
            airfoil_name: airfoil.airfoil.airfoil_name,
            reynolds_number: airfoil.airfoil.reynolds_number,
            angle_of_attack: airfoil.airfoil.angle_of_attack,
            cl: airfoil.airfoil.cl,
            cd: airfoil.airfoil.cd,
            cm: airfoil.airfoil.cm,
            cl_cd_ratio: airfoil.airfoil.cl_cd_ratio
          }, 
          config 
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setOptimizationResult(data.result)
      
      // Update progress based on actual optimization history
      setOptimizationProgress({
        currentIteration: data.result.optimization_history.iterations,
        maxIterations: config.max_iterations,
        bestFitness: data.result.optimization_history.best_fitness
      })
    } catch (error) {
      console.error("Optimization failed:", error)
    } finally {
      setIsOptimizing(false)
      setOptimizationProgress(undefined)
    }
  }
  
  const handleExportResults = () => {
    const airfoilToExport = aiGenerationResult?.generated_airfoil || optimizationResult?.optimized_airfoil
    if (!airfoilToExport) return

    // Generate .dat file
    let datContent = `${airfoilToExport.airfoil_name}\n`
    airfoilToExport.geometry.forEach((point) => {
      datContent += `${point[0].toFixed(6)} ${point[1].toFixed(6)}\n`
    })

    const blob = new Blob([datContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${airfoilToExport.airfoil_name.replace(/\s+/g, "_")}.dat`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleAIGeneration = async (targets: TargetProperties, config: AIGenerationConfig) => {
    setIsGenerating(true)
    setOptimizationResult(undefined)
    setSelectedAirfoil(null)
    setAiGenerationResult(null)
    setPlotMode("ai_generation")

    // Simulate realistic AI generation status updates
    const statusMessages = [
      "Initializing neural networks...",
      "Loading pre-trained models...",
      "Encoding design parameters...",
      "Sampling latent space...",
      "Running generative model...",
      "Optimizing geometry constraints...",
      "Evaluating aerodynamic feasibility...",
      "Refining airfoil shape...",
      "Decoding final geometry...",
      "Validating performance predictions...",
      "Finalizing design...",
    ]

    let messageIndex = 0
    const statusInterval = setInterval(() => {
      if (messageIndex < statusMessages.length) {
        setGenerationStatus(statusMessages[messageIndex])
        messageIndex++
      } else {
        clearInterval(statusInterval)
      }
    }, 350)

    try {
      const response = await fetch("/api/ai-generated", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ targets, config }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      setAiGenerationResult(data.result)
    } catch (error) {
      console.error("AI generation failed:", error)
    } finally {
      setIsGenerating(false)
      setGenerationStatus("")
      clearInterval(statusInterval)
    }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        onExportResults={handleExportResults}
        hasResults={!!(optimizationResult || aiGenerationResult)}
      />
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r p-4 overflow-y-auto">
        <SidebarContent
            onSearch={handleSimilaritySearch}
            onOptimize={handleOptimization}
            onPlotAirfoil={handlePlotAirfoil}
            onGenerateAI={handleAIGeneration}
            similarityResults={similarityResults}
            aiGenerationResult={aiGenerationResult ?? undefined}
            isSearching={isSearching}
            isOptimizing={isOptimizing}
            isGenerating={isGenerating}
            generationStatus={generationStatus}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4">
          <MainVisualization
            selectedAirfoil={selectedAirfoil ?? undefined}
            optimizationResult={optimizationResult}
            isOptimizing={isOptimizing}
            optimizationProgress={optimizationProgress}
            plotMode={plotMode}
            aiGenerationResult={aiGenerationResult ?? undefined}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  )
}
