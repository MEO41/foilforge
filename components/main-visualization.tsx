"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Sparkles } from "lucide-react"
import type { AirfoilData, OptimizationResult, SimilarityResult,AIGenerationResult } from "../types/airfoil"
import { ResultsProgressPanel } from "./results-progress-panel"

interface MainVisualizationProps {
  selectedAirfoil?: SimilarityResult
  optimizationResult?: OptimizationResult
  aiGenerationResult?: AIGenerationResult
  isOptimizing?: boolean
  isGenerating?: boolean
  optimizationProgress?: {
    currentIteration: number
    maxIterations: number
    bestFitness: number
  }
  plotMode?: "preview" | "optimization" | "ai_generation"
}

export function MainVisualization({
  selectedAirfoil,
  optimizationResult,
  isOptimizing,
  optimizationProgress,
  aiGenerationResult,
  isGenerating,
  plotMode = "preview",
}: MainVisualizationProps) {
  const renderAirfoilGeometry = (airfoil: AirfoilData, color: string, strokeDasharray?: string) => {
    if (!airfoil.geometry || airfoil.geometry.length === 0) return null


    const plotWidth = 600
    const plotHeight = 300
    const margin = { top: 20, right: 20, bottom: 40, left: 60 }

    const pathData =
      airfoil.geometry
        .map((point, index) => {
          const x = margin.left + point[0] * (plotWidth - margin.left - margin.right)
          const y =
            margin.top +
            (0.5 - point[1]) * (plotHeight - margin.top - margin.bottom) +
            (plotHeight - margin.top - margin.bottom) / 2
          return `${index === 0 ? "M" : "L"} ${x} ${y}`
        })
        .join(" ") + " Z"

    return (
      <svg width={plotWidth} height={plotHeight} className="border">
        {/* Grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Axes */}
        <line
          x1={margin.left}
          y1={plotHeight - margin.bottom}
          x2={plotWidth - margin.right}
          y2={plotHeight - margin.bottom}
          stroke="#333"
          strokeWidth="1"
        />
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={plotHeight - margin.bottom}
          stroke="#333"
          strokeWidth="1"
        />

        {/* Chord line */}
        <line
          x1={margin.left}
          y1={plotHeight / 2}
          x2={plotWidth - margin.right}
          y2={plotHeight / 2}
          stroke="#999"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Airfoil */}
        <path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeDasharray={strokeDasharray} />

        {/* Labels */}
        <text x={plotWidth / 2} y={plotHeight - 5} textAnchor="middle" className="text-xs fill-gray-600">
          x/c
        </text>
        <text
          x={15}
          y={plotHeight / 2}
          textAnchor="middle"
          className="text-xs fill-gray-600"
          transform={`rotate(-90, 15, ${plotHeight / 2})`}
        >
          y/c
        </text>
      </svg>
    )
  }

  const getVisualizationTitle = () => {
    if (optimizationResult) {
      return "Airfoil Optimization Comparison"
    } else if (aiGenerationResult) {
      return `AI Generated Airfoil: ${aiGenerationResult.generated_airfoil.airfoil_name}`
    }else if (selectedAirfoil && plotMode === "preview") {
      return `Airfoil Preview: ${selectedAirfoil.airfoil.airfoil_name}`
    } else if (selectedAirfoil) {
      return "Selected Airfoil Profile"
    }
    return "Airfoil Profile"
  }
  
  const getCurrentAirfoil = () => {
    if (aiGenerationResult) return aiGenerationResult.generated_airfoil
    if (selectedAirfoil) return selectedAirfoil.airfoil
    return null
  }

  return (
    <div className="space-y-4">
      {/* Airfoil Visualization */}
      <Card className="h-[500px]">
        <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">{getVisualizationTitle()}</CardTitle>
            {plotMode === "preview" && selectedAirfoil && (
              <Badge variant="outline" className="text-xs">
                Preview Mode
              </Badge>
            )}
                        {plotMode === "ai_generation" && aiGenerationResult && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            )}
          </div>    
              </CardHeader>
        <CardContent className="h-full">
          {selectedAirfoil || getCurrentAirfoil() || optimizationResult ? (
            <div className="space-y-4">
              <div className="w-full overflow-x-auto">
                {optimizationResult && selectedAirfoil ? (
                  <div className="relative">
                    {renderAirfoilGeometry(selectedAirfoil.airfoil, "#2563eb", "5,5")}
                    <div className="absolute top-0 left-0">
                      {renderAirfoilGeometry({
                        ...optimizationResult.optimized_airfoil,
                        airfoil_id: "optimized",
                        airfoil_name: optimizationResult.optimized_airfoil.airfoil_name,
                        airfoil_file: "",
                        reynolds_number: 0,
                        angle_of_attack: 0,
                        optimized_cl: optimizationResult.optimized_airfoil.cl,
                        optimized_cd: optimizationResult.optimized_airfoil.cd,
                        optimized_cm: optimizationResult.optimized_airfoil.cm,
                        optimized_cl_cd_ratio: 0,
                        cl_cd_ratio: 0,
                        similarity: selectedAirfoil.similarity_score,
                        cl: 0,
                        cd: 0,
                        cm: 0,
                      }, "#dc2626")}
                    </div>
                  </div>
                ) : getCurrentAirfoil() ? (
                  renderAirfoilGeometry(getCurrentAirfoil()!, aiGenerationResult ? "#8b5cf6" : "#2563eb")
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Select an airfoil to view its geometry</p>
                <p className="text-sm mt-1">Use "Plot" button or "Generate" with AI</p>
              </div>
            </div>
          )}
        </CardContent>  
      </Card>

      {/* Results and Progress */}
      <ResultsProgressPanel
        selectedAirfoil={selectedAirfoil}
        optimizationResult={optimizationResult}
        aiGenerationResult={aiGenerationResult}
        isOptimizing={isOptimizing}
        isGenerating={isGenerating}
        optimizationProgress={optimizationProgress}
      />
    </div>
  )
}
