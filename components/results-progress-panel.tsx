"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import type { AirfoilData, OptimizationResult, SimilarityResult, AIGenerationResult } from "../types/airfoil"

interface ResultsProgressPanelProps {
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
}

export function ResultsProgressPanel({
  selectedAirfoil,
  optimizationResult,
  aiGenerationResult,
  isOptimizing,
  isGenerating,
  optimizationProgress,
}: ResultsProgressPanelProps) {
  const getCurrentAirfoil = () => {
    if (aiGenerationResult) return aiGenerationResult.generated_airfoil
    if (selectedAirfoil) return selectedAirfoil.airfoil
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4 mt-4">
            {optimizationResult ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {optimizationResult.improvement_metrics.map((metric, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm">{metric.property}</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Original:</span>
                        <span className="font-mono">{metric.original.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Optimized:</span>
                        <span className="font-mono">{metric.optimized.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
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
            ) : aiGenerationResult ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Predicted Cl</span>
                    <Badge variant="secondary">{aiGenerationResult.predicted_performance.cl.toFixed(3)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Predicted Cd</span>
                    <Badge variant="secondary">{aiGenerationResult.predicted_performance.cd.toFixed(4)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Predicted Cm</span>
                    <Badge variant="secondary">{aiGenerationResult.predicted_performance.cm.toFixed(3)}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Predicted L/D</span>
                    <Badge variant="outline">{aiGenerationResult.predicted_performance.cl_cd_ratio.toFixed(1)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">AI Confidence</span>
                    <Badge variant="outline">
                      {(aiGenerationResult.generation_metadata.confidence_score * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Design Novelty</span>
                    <Badge variant="outline">
                      {(aiGenerationResult.generation_metadata.design_novelty * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ) : getCurrentAirfoil() ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lift Coefficient (Cl)</span>
                    <Badge variant="secondary">{getCurrentAirfoil()!.cl.toFixed(3)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Drag Coefficient (Cd)</span>
                    <Badge variant="secondary">{getCurrentAirfoil()!.cd.toFixed(4)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Moment Coefficient (Cm)</span>
                    <Badge variant="secondary">{getCurrentAirfoil()!.cm.toFixed(3)}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">L/D Ratio</span>
                    <Badge variant="outline">{getCurrentAirfoil()!.cl_cd_ratio.toFixed(1)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reynolds Number</span>
                    <Badge variant="outline">{getCurrentAirfoil()!.reynolds_number.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Angle of Attack</span>
                    <Badge variant="outline">{getCurrentAirfoil()!.angle_of_attack.toFixed(1)}°</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No performance data available</div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-4">
            {isOptimizing && optimizationProgress ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Iteration {optimizationProgress.currentIteration} of {optimizationProgress.maxIterations}
                    </span>
                    <span>
                      {((optimizationProgress.currentIteration / optimizationProgress.maxIterations) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={(optimizationProgress.currentIteration / optimizationProgress.maxIterations) * 100} />
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Best Fitness: </span>
                  <span className="font-mono">{optimizationProgress.bestFitness.toFixed(6)}</span>
                </div>
                <Badge variant="secondary" className="animate-pulse">
                  Optimizing...
                </Badge>
              </div>
            ) : isGenerating ? (
              <div className="space-y-4">
                <div className="text-sm text-purple-600 font-medium">AI Generation in Progress</div>
                <Progress value={undefined} className="w-full" />
                <Badge variant="secondary" className="animate-pulse bg-purple-100 text-purple-700">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generating...
                </Badge>
              </div>
            ) : optimizationResult ? (
              <div className="space-y-2">
                <div className="text-sm text-green-600 font-medium">Optimization Complete</div>
                <div className="text-sm">
                  <span className="text-gray-600">Final Fitness: </span>
                  <span className="font-mono">
                    {optimizationResult.optimization_history[optimizationResult.optimization_history.length - 1]?.fitness.toFixed(6)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Iterations: </span>
                  <span>{optimizationResult.optimization_history.length}</span>
                </div>
              </div>
            ) : aiGenerationResult ? (
              <div className="space-y-2">
                <div className="text-sm text-purple-600 font-medium">AI Generation Complete</div>
                <div className="text-sm">
                  <span className="text-gray-600">Method: </span>
                  <span>{aiGenerationResult.generation_metadata.method_used}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Generation Time: </span>
                  <span>{aiGenerationResult.generation_metadata.generation_time.toFixed(2)}s</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No process in progress</div>
            )}
          </TabsContent>

          <TabsContent value="coordinates" className="mt-4">
            {getCurrentAirfoil() || optimizationResult ? (
              <div className="h-48 bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">
                <div className="text-xs font-mono space-y-1">
                  <div className="grid grid-cols-2 gap-4 font-semibold border-b pb-1">
                    <span>X/C</span>
                    <span>Y/C</span>
                  </div>
                  {(optimizationResult?.optimized_airfoil.geometry || getCurrentAirfoil()?.geometry || [])
                    .slice(0, 10)
                    .map((point, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4">
                        <span>{point[0].toFixed(6)}</span>
                        <span>{point[1].toFixed(6)}</span>
                      </div>
                    ))}
                  <div className="text-center text-gray-400 pt-2">
                    ... (
                    {(optimizationResult?.optimized_airfoil.geometry || getCurrentAirfoil()?.geometry || []).length} total
                    points)
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No coordinate data available</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 