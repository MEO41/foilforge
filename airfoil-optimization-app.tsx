"use client"

import { useState } from "react"
import { TargetPropertiesForm } from "./components/target-properties-form"
import { SimilarityResults } from "./components/similarity-results"
import { OptimizationControls, type OptimizationConfig } from "./components/optimization-controls"
import { AirfoilGeometryPlot } from "./components/airfoil-geometry-plot"
import { OptimizationProgress } from "./components/optimization-progress"
import { DownloadControls } from "./components/download-controls"
import type { TargetProperties, PropertyWeights, SimilarityResult, OptimizationResult } from "./types/airfoil"

export default function AirfoilOptimizationApp() {
  const [isSearching, setIsSearching] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [similarityResults, setSimilarityResults] = useState<SimilarityResult[]>([])
  const [selectedAirfoil, setSelectedAirfoil] = useState<SimilarityResult | null>(null)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [currentTargets, setCurrentTargets] = useState<TargetProperties | null>(null)

  const handleSimilaritySearch = async (targets: TargetProperties, weights: PropertyWeights) => {
    setIsSearching(true)
    setCurrentTargets(targets)

    try {
      const response = await fetch("/api/similarity-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targets, weights }),
      })

      const data = await response.json()
      setSimilarityResults(data.results)
    } catch (error) {
      console.error("Similarity search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleOptimizeAirfoil = (airfoil: SimilarityResult) => {
    setSelectedAirfoil(airfoil)
    setOptimizationResult(null)
  }

  const handleStartOptimization = async (config: OptimizationConfig) => {
    if (!selectedAirfoil || !currentTargets) return

    setIsOptimizing(true)

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          //airfoil: selectedAirfoil.airfoil,
          config,
          targets: currentTargets,
        }),
      })

      const data = await response.json()
      setOptimizationResult(data.result)
    } catch (error) {
      console.error("Optimization failed:", error)
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Airfoil Optimization Tool</h1>
        <p className="text-gray-600 mt-1">Neural network-powered airfoil design and optimization</p>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-96 bg-white border-r p-4 space-y-4 h-[calc(100vh-89px)] overflow-y-auto">
          <TargetPropertiesForm onSearch={handleSimilaritySearch} isLoading={isSearching} />

          {selectedAirfoil && (
            <OptimizationControls onStartOptimization={handleStartOptimization} isOptimizing={isOptimizing} />
          )}

          <DownloadControls optimizationResult={optimizationResult} />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Similarity Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SimilarityResults
                results={similarityResults}
                onOptimize={handleOptimizeAirfoil}
                isOptimizing={isOptimizing}
              />
            </div>

            <div>
              <OptimizationProgress
                isOptimizing={isOptimizing}
                currentIteration={isOptimizing ? 45 : 0}
                maxIterations={100}
                bestFitness={isOptimizing ? 0.987 : undefined}
                //convergenceHistory={optimizationResult?.optimization_history || []}
              />
            </div>
          </div>

          {/* Visualization */}
          {(selectedAirfoil || optimizationResult) && (
            <AirfoilGeometryPlot
              originalAirfoil={selectedAirfoil}
              //optimizedAirfoil={optimizationResult?.optimized_airfoil}
              title="Airfoil Geometry Comparison"
            />
          )}

          {/* Performance Comparison */}
          {optimizationResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {optimizationResult.improvement_metrics.map((metric, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-900">{metric.property}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Original:</span>
                      <span className="font-mono">{metric.original.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Optimized:</span>
                      <span className="font-mono">{metric.optimized.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Improvement:</span>
                      <span className={metric.improvement_percent > 0 ? "text-green-600" : "text-red-600"}>
                        {metric.improvement_percent > 0 ? "+" : ""}
                        {metric.improvement_percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
