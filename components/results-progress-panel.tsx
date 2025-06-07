"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { AirfoilData, OptimizationResult, SimilarityResult } from "../types/airfoil"

interface ResultsProgressPanelProps {
  selectedAirfoil?: SimilarityResult
  optimizationResult?: OptimizationResult
  isOptimizing?: boolean
  optimizationProgress?: {
    currentIteration: number
    maxIterations: number
    bestFitness: number
  }
}

export function ResultsProgressPanel({
  selectedAirfoil,
  optimizationResult,
  isOptimizing,
  optimizationProgress,
}: ResultsProgressPanelProps) {
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
            {optimizationResult && selectedAirfoil ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm">Lift Coefficient (Cl)</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Original:</span>
                      <span className="font-mono">{selectedAirfoil.airfoil.cl.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Optimized:</span>
                      <span className="font-mono">{optimizationResult.optimized_airfoil.cl.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Improvement:</span>
                      <span className="text-green-600">
                        {((optimizationResult.optimized_airfoil.cl - selectedAirfoil.airfoil.cl) / selectedAirfoil.airfoil.cl * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm">Drag Coefficient (Cd)</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Original:</span>
                      <span className="font-mono">{selectedAirfoil.airfoil.cd.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Optimized:</span>
                      <span className="font-mono">{optimizationResult.optimized_airfoil.cd.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Improvement:</span>
                      <span className="text-green-600">
                        {((selectedAirfoil.airfoil.cd - optimizationResult.optimized_airfoil.cd) / selectedAirfoil.airfoil.cd * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm">Moment Coefficient (Cm)</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Original:</span>
                      <span className="font-mono">{selectedAirfoil.airfoil.cm.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Optimized:</span>
                      <span className="font-mono">{optimizationResult.optimized_airfoil.cm.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Improvement:</span>
                      <span className="text-green-600">
                        {((selectedAirfoil.airfoil.cm - optimizationResult.optimized_airfoil.cm) / selectedAirfoil.airfoil.cm * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4 mt-4">
            {isOptimizing && optimizationProgress ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Optimization Progress</span>
                    <span>
                      {optimizationProgress.currentIteration} / {optimizationProgress.maxIterations}
                    </span>
                  </div>
                  <Progress
                    value={(optimizationProgress.currentIteration / optimizationProgress.maxIterations) * 100}
                  />
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Best Fitness:</span>
                    <span className="font-mono">{optimizationProgress.bestFitness.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="coordinates" className="space-y-4 mt-4">
            {selectedAirfoil && (
              <div className="space-y-4">
                <div className="text-sm">
                  <h4 className="font-medium mb-2">Airfoil Coordinates</h4>
                  <div className="bg-gray-50 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre>
                      {selectedAirfoil.airfoil.geometry
                        .map((point) => `${point[0].toFixed(6)} ${point[1].toFixed(6)}`)
                        .join("\n")}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 