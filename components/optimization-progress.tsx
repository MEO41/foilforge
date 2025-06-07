"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface OptimizationProgressProps {
  isOptimizing: boolean
  currentIteration?: number
  maxIterations?: number
  bestFitness?: number
  convergenceHistory?: { iteration: number; fitness: number }[]
}

export function OptimizationProgress({
  isOptimizing,
  currentIteration = 0,
  maxIterations = 100,
  bestFitness,
  convergenceHistory = [],
}: OptimizationProgressProps) {
  const progress = maxIterations > 0 ? (currentIteration / maxIterations) * 100 : 0

  if (!isOptimizing && convergenceHistory.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          Optimization Progress
          {isOptimizing && (
            <Badge variant="secondary" className="animate-pulse">
              Running
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOptimizing && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Iteration {currentIteration} of {maxIterations}
                </span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} />
            </div>

            {bestFitness !== undefined && (
              <div className="text-sm">
                <span className="text-gray-600">Best Fitness: </span>
                <span className="font-mono">{bestFitness.toFixed(6)}</span>
              </div>
            )}
          </>
        )}

        {convergenceHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Convergence History</h4>
            <div className="h-32 bg-gray-50 border rounded p-2">
              <svg width="100%" height="100%" viewBox="0 0 300 100">
                {convergenceHistory.length > 1 && (
                  <polyline
                    points={convergenceHistory
                      .map((point, index) => {
                        const x = (index / (convergenceHistory.length - 1)) * 280 + 10
                        const y =
                          90 -
                          ((point.fitness - Math.min(...convergenceHistory.map((p) => p.fitness))) /
                            (Math.max(...convergenceHistory.map((p) => p.fitness)) -
                              Math.min(...convergenceHistory.map((p) => p.fitness)))) *
                            70
                        return `${x},${y}`
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                  />
                )}
              </svg>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
