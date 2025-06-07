"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Settings, Sparkles, Cpu } from "lucide-react"
import type {
  TargetProperties,
  PropertyWeights,
  SimilarityResult,
  OptimizationConfig,
  AIGenerationConfig,
  AIGenerationResult,
} from "../types/airfoil"

interface SidebarContentProps {
  onSearch: (targets: TargetProperties, weights: PropertyWeights) => void
  onOptimize: (airfoil: SimilarityResult, config: OptimizationConfig) => void
  onPlotAirfoil: (airfoil: SimilarityResult) => void
  onGenerateAI: (targets: TargetProperties, config: AIGenerationConfig) => void
  similarityResults: SimilarityResult[]
  aiGenerationResult?: AIGenerationResult
  isSearching?: boolean
  isOptimizing?: boolean  
  isGenerating?: boolean
  generationStatus?: string
}

// Preset configurations for different airfoil types
const PRESET_CONFIGS = {
  default: {
    name: "Default",
    description: "Standard configuration for general use",
    targets: {
      reynolds_number: 1000000,
      angle_of_attack: 5.0,
      cl: 0.82,
      cd: 0.012,
      cm: -0.05,
      cl_cd_ratio: 66.7,
    },
    weights: {
      reynolds_number: 0,
      angle_of_attack: 0.9,
      cl: 1.0,
      cd: 1.0,
      cm: 0.6,
      cl_cd_ratio: 0.9
    }
  },
  high_lift: {
    name: "High Lift",
    description: "Optimized for maximum lift coefficient",
    targets: {
      reynolds_number: 1000000,
      angle_of_attack: 8.0,
      cl: 1.2,
      cd: 0.015,
      cm: -0.08,
      cl_cd_ratio: 80.0,
    },
    weights: {
      reynolds_number: 0,
      angle_of_attack: 0.8,
      cl: 1.2,
      cd: 0.9,
      cm: 0.5,
      cl_cd_ratio: 1.0,
    }
  },
  low_drag: {
    name: "Low Drag",
    description: "Optimized for minimum drag coefficient",
    targets: {
      reynolds_number: 2000000,
      angle_of_attack: 2.0,
      cl: 0.6,
      cd: 0.008,
      cm: -0.03,
      cl_cd_ratio: 75.0,
    },
    weights: {
      reynolds_number: 0,
      angle_of_attack: 0.7,
      cl: 0.8,
      cd: 1.2,
      cm: 0.5,
      cl_cd_ratio: 1.1,
    }
  },
  balanced: {
    name: "Balanced Performance",
    description: "Balanced configuration for optimal performance",
    targets: {
      reynolds_number: 1500000,
      angle_of_attack: 4.0,
      cl: 0.9,
      cd: 0.010,
      cm: -0.06,
      cl_cd_ratio: 90.0,
    },
    weights: {
      reynolds_number: 0,
      angle_of_attack: 0.8,
      cl: 1.0,
      cd: 1.0,
      cm: 0.7,
      cl_cd_ratio: 1.0,
    }
  }
} as const

// Add search status type
type SearchStatus = {
  message: string
  progress: number
}

export function SidebarContent({
  onSearch,
  onOptimize,
  onPlotAirfoil,
  onGenerateAI,
  aiGenerationResult,
  similarityResults,
  isSearching,
  isOptimizing,
  isGenerating,
  generationStatus,
}: SidebarContentProps) {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESET_CONFIGS>("default")
  const [targets, setTargets] = useState<TargetProperties>(PRESET_CONFIGS.default.targets)
  const [rawWeights, setRawWeights] = useState<PropertyWeights>(PRESET_CONFIGS.default.weights)
  const [searchStatus, setSearchStatus] = useState<SearchStatus | null>(null)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)

  const handlePresetChange = (preset: keyof typeof PRESET_CONFIGS) => {
    setSelectedPreset(preset)
    setTargets(PRESET_CONFIGS[preset].targets)
    setRawWeights(PRESET_CONFIGS[preset].weights)
  }

  const [aiTargets, setAiTargets] = useState<TargetProperties>({
    reynolds_number: 1000000,
    angle_of_attack: 5.0,
    cl: 0.8,
    cd: 0.012,
    cm: -0.05,
    cl_cd_ratio: 66.7,
  })

  
  const [aiConfig, setAiConfig] = useState<AIGenerationConfig>({
    method: "gan",
    creativity_level: 0.7,
    constraint_weight: 0.8,
    seed: undefined,
  })

  
  const handleAiTargetChange = (property: keyof TargetProperties, value: number) => {
    setAiTargets((prev) => ({ ...prev, [property]: value }))
  }

  const handleGenerateAI = () => {
    onGenerateAI(aiTargets, aiConfig)
  }
  // Normalize weights to sum to 1
  const normalizedWeights = useMemo(() => {
    const sum = Object.values(rawWeights).reduce((acc, val) => acc + val, 0)
    if (sum === 0) return rawWeights // Avoid division by zero
    
    return Object.fromEntries(
      Object.entries(rawWeights).map(([key, value]) => [key, value / sum])
    ) as unknown as PropertyWeights
  }, [rawWeights])

  const [optimizationConfig, setOptimizationConfig] = useState<OptimizationConfig>({
    algorithm: "genetic",
    population_size: 50,
    max_iterations: 100,
    convergence_tolerance: 1e-6,
    mutation_rate: 0.1,
    crossover_rate: 0.8,
  })

  const [selectedAirfoil, setSelectedAirfoil] = useState<SimilarityResult | null>(null)

  const handleTargetChange = (property: keyof TargetProperties, value: number) => {
    setTargets((prev) => ({ ...prev, [property]: value }))
    // Reset to custom preset when manually changing values
    setSelectedPreset("default")
  }

  const handleWeightChange = (property: keyof PropertyWeights, value: number[]) => {
    setRawWeights((prev) => ({ ...prev, [property]: value[0] }))
  }

  const handleSearch = async () => {
    // Disable button and start animation
    setIsButtonDisabled(true)
    setSearchStatus({ message: "API Called", progress: 0 })
    
    // Simulate API call progress
    setTimeout(() => {
      setSearchStatus({ message: "Similarity Search Started", progress: 33 })
    }, 250)

    setTimeout(() => {
      setSearchStatus({ message: "Analyzing Results", progress: 66 })
    }, 750)

    setTimeout(() => {
      setSearchStatus({ message: "Finalizing...", progress: 90 })
    }, 1250)

    // Call the actual search function
    onSearch(targets, normalizedWeights)

    // Clear status and re-enable button after animation completes
    setTimeout(() => {
      setSearchStatus(null)
      setIsButtonDisabled(false)
    }, 3500)
  }
  
  const handlePlotAirfoil = (airfoil: SimilarityResult) => {
    setSelectedAirfoil(airfoil)
    onPlotAirfoil(airfoil)
  }
  const handleOptimizeAirfoil = (airfoil: SimilarityResult) => {
    setSelectedAirfoil(airfoil)
    onOptimize(airfoil, optimizationConfig)
  }
  const handlePlotButton = (airfoil: SimilarityResult) => {
    console.log("Plot button clicked")
    setSelectedAirfoil(airfoil)
    console.log("Airfoil Selected")
  }

  // Calculate total weight for display
  const totalWeight = Object.values(rawWeights).reduce((sum, weight) => sum + weight, 0)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="targets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="targets">Targets</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="optimize">Optimize</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
        </TabsList>

        <TabsContent value="targets" className="space-y-0.5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Target Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preset Selector */}
              <div className="space-y-4">
                <Label htmlFor="preset" className="text-sm font-medium">
                  Preset Configuration
                </Label>
                <Select value={selectedPreset} onValueChange={(value) => handlePresetChange(value as keyof typeof PRESET_CONFIGS)}>
                  <SelectTrigger id="preset" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRESET_CONFIGS).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{config.name}</span>
                          <span className="text-xs text-gray-500">{config.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPreset !== "default" && (
                  <p className="text-xs text-gray-500">
                    Selected: {PRESET_CONFIGS[selectedPreset].name} - {PRESET_CONFIGS[selectedPreset].description}
                  </p>
                )}
              </div>

              <Separator className="my-2" />

              {/* Target Values */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="reynolds" className="text-sm">
                    Reynolds Number
                  </Label>
                  <Input
                    id="reynolds"
                    type="number"
                    value={targets.reynolds_number}
                    onChange={(e) => handleTargetChange("reynolds_number", Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="aoa" className="text-sm">
                    Angle of Attack (°)
                  </Label>
                  <Input
                    id="aoa"
                    type="number"
                    step="0.1"
                    value={targets.angle_of_attack}
                    onChange={(e) => handleTargetChange("angle_of_attack", Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cl" className="text-sm">
                    Cl
                  </Label>
                  <Input
                    id="cl"
                    type="number"
                    step="0.01"
                    value={targets.cl}
                    onChange={(e) => handleTargetChange("cl", Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cd" className="text-sm">
                    Cd
                  </Label>
                  <Input
                    id="cd"
                    type="number"
                    step="0.001"
                    value={targets.cd}
                    onChange={(e) => handleTargetChange("cd", Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cm" className="text-sm">
                    Cm
                  </Label>
                  <Input
                    id="cm"
                    type="number"
                    step="0.01"
                    value={targets.cm}
                    onChange={(e) => handleTargetChange("cm", Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cl_cd" className="text-sm">
                    Cl/Cd
                  </Label>
                  <Input
                    id="cl_cd"
                    type="number"
                    step="0.1"
                    value={targets.cl_cd_ratio}
                    onChange={(e) => handleTargetChange("cl_cd_ratio", Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              {/* Importance Weights */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Importance Weights</h4>
                  <span className="text-xs text-gray-500">Total: {totalWeight.toFixed(1)}</span>
                </div>
                {Object.entries(rawWeights).map(([property, weight]) => (
                  <div key={property} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs capitalize">{property.replace("_", " ")}</Label>
                      <span className="text-xs text-gray-500 font-mono">
                        {weight.toFixed(1)} ({((weight / totalWeight) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <Slider
                      value={[weight]}
                      onValueChange={(value) => handleWeightChange(property as keyof PropertyWeights, value)}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleSearch} 
                className="w-full relative" 
                disabled={isButtonDisabled || isSearching}
              >
                {isButtonDisabled ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  "Find Similar Airfoils"
                )}
              </Button>

              {/* Search Status Indicator */}
              {searchStatus && (
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{searchStatus.message}</span>
                    <span className="text-gray-500">{searchStatus.progress}%</span>
                  </div>
                  <Progress value={searchStatus.progress} className="h-1" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Similarity Results</CardTitle>
            </CardHeader>
            <CardContent>
              {similarityResults.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No results yet. Search for similar airfoils first.</div>
              ) : (
                <div className="space-y-3">
                  {similarityResults.map((result, index) => (
                    result.airfoil && (
                      <div key={`${result.airfoil.airfoil_name}-${index}`} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-sm">{result.airfoil.airfoil_name}</h4>
                            <p className="text-xs text-gray-500">Rank #{index + 1}</p>
                          </div>
                          <Badge variant="secondary">{(result.similarity_score).toFixed(1)}%</Badge>
                        </div>
                        <Progress value={result.similarity_score} className="mb-2" />
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>Cl: {result.airfoil.cl.toFixed(8)}</div>
                          <div>Cd: {result.airfoil.cd.toFixed(8)}</div>
                          <div>Cm: {result.airfoil.cm.toFixed(8)}</div>
                          <div>L/D: {result.airfoil.cl_cd_ratio.toFixed(2)}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                        <Button
                            onClick={() => handlePlotAirfoil(result)}
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Plot
                          </Button>
                          <Button
                            onClick={() => handleOptimizeAirfoil(result)}
                            size="sm"
                            className="flex-1"
                            disabled={isOptimizing}
                          >
                            {isOptimizing ? "Optimizing..." : "Optimize"}
                          </Button>
                         
                        
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Optimization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="algorithm" className="text-sm">
                    Algorithm
                  </Label>
                  <Select
                    value={optimizationConfig.algorithm}
                    onValueChange={(value) =>
                      setOptimizationConfig((prev) => ({ ...prev, algorithm: value as "genetic" | "particle_swarm" }))
                    }
                  >
                    <SelectTrigger id="algorithm" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                      <SelectItem value="particle_swarm">Particle Swarm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="population" className="text-sm">
                    Population Size
                  </Label>
                  <Input
                    id="population"
                    type="number"
                    value={optimizationConfig.population_size}
                    onChange={(e) =>
                      setOptimizationConfig((prev) => ({ ...prev, population_size: Number(e.target.value) }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="iterations" className="text-sm">
                    Max Iterations
                  </Label>
                  <Input
                    id="iterations"
                    type="number"
                    value={optimizationConfig.max_iterations}
                    onChange={(e) =>
                      setOptimizationConfig((prev) => ({ ...prev, max_iterations: Number(e.target.value) }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tolerance" className="text-sm">
                    Convergence Tolerance
                  </Label>
                  <Input
                    id="tolerance"
                    type="number"
                    step="1e-6"
                    value={optimizationConfig.convergence_tolerance}
                    onChange={(e) =>
                      setOptimizationConfig((prev) => ({ ...prev, convergence_tolerance: Number(e.target.value) }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="mutation" className="text-sm">
                    Mutation Rate
                  </Label>
                  <Input
                    id="mutation"
                    type="number"
                    step="0.1"
                    value={optimizationConfig.mutation_rate}
                    onChange={(e) =>
                      setOptimizationConfig((prev) => ({ ...prev, mutation_rate: Number(e.target.value) }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="crossover" className="text-sm">
                    Crossover Rate
                  </Label>
                  <Input
                    id="crossover"
                    type="number"
                    step="0.1"
                    value={optimizationConfig.crossover_rate}
                    onChange={(e) =>
                      setOptimizationConfig((prev) => ({ ...prev, crossover_rate: Number(e.target.value) }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {selectedAirfoil && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 mb-2">Selected for optimization:</p>
                  <Badge variant="outline">{selectedAirfoil.airfoil.airfoil_name}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Target Properties */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Target Properties</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ai-reynolds" className="text-sm">
                      Reynolds Number
                    </Label>
                    <Input
                      id="ai-reynolds"
                      type="number"
                      value={aiTargets.reynolds_number}
                      onChange={(e) => handleAiTargetChange("reynolds_number", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ai-aoa" className="text-sm">
                      Angle of Attack (°)
                    </Label>
                    <Input
                      id="ai-aoa"
                      type="number"
                      step="0.1"
                      value={aiTargets.angle_of_attack}
                      onChange={(e) => handleAiTargetChange("angle_of_attack", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ai-cl" className="text-sm">
                      Cl
                    </Label>
                    <Input
                      id="ai-cl"
                      type="number"
                      step="0.01"
                      value={aiTargets.cl}
                      onChange={(e) => handleAiTargetChange("cl", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ai-cd" className="text-sm">
                      Cd
                    </Label>
                    <Input
                      id="ai-cd"
                      type="number"
                      step="0.001"
                      value={aiTargets.cd}
                      onChange={(e) => handleAiTargetChange("cd", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ai-cm" className="text-sm">
                      Cm
                    </Label>
                    <Input
                      id="ai-cm"
                      type="number"
                      step="0.01"
                      value={aiTargets.cm}
                      onChange={(e) => handleAiTargetChange("cm", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ai-cl-cd" className="text-sm">
                      Cl/Cd
                    </Label>
                    <Input
                      id="ai-cl-cd"
                      type="number"
                      step="0.1"
                      value={aiTargets.cl_cd_ratio}
                      onChange={(e) => handleAiTargetChange("cl_cd_ratio", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* AI Configuration */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">AI Configuration</h4>

                <div>
                  <Label htmlFor="ai-method" className="text-sm">
                    Generation Method
                  </Label>
                  <Select
                    value={aiConfig.method}
                    onValueChange={(value) => setAiConfig((prev) => ({ ...prev, method: value as any }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gan">Generative Adversarial Network</SelectItem>
                      <SelectItem value="vae">Variational Autoencoder</SelectItem>
                      <SelectItem value="diffusion">Diffusion Model</SelectItem>
                      <SelectItem value="transformer">Transformer Architecture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm">Creativity Level</Label>
                    <span className="text-xs text-gray-500 font-mono">{aiConfig.creativity_level.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[aiConfig.creativity_level]}
                    onValueChange={(value) => setAiConfig((prev) => ({ ...prev, creativity_level: value[0] }))}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Conservative</span>
                    <span>Innovative</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm">Constraint Weight</Label>
                    <span className="text-xs text-gray-500 font-mono">{aiConfig.constraint_weight.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[aiConfig.constraint_weight]}
                    onValueChange={(value) => setAiConfig((prev) => ({ ...prev, constraint_weight: value[0] }))}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Flexible</span>
                    <span>Strict</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="ai-seed" className="text-sm">
                    Random Seed (Optional)
                  </Label>
                  <Input
                    id="ai-seed"
                    type="number"
                    placeholder="Leave empty for random"
                    value={aiConfig.seed || ""}
                    onChange={(e) =>
                      setAiConfig((prev) => ({
                        ...prev,
                        seed: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Generation Status */}
              {isGenerating && (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-blue-600 animate-spin" />
                    <span className="text-sm font-medium text-blue-800">AI Generation in Progress</span>
                  </div>
                  <div className="text-sm text-blue-700">{generationStatus}</div>
                  <Progress value={undefined} className="w-full" />
                </div>
              )}

              {/* Generated Result */}
              {aiGenerationResult && (
                <div className="space-y-2 p-3 bg-green-50 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Generation Complete</span>
                  </div>
                  <div className="text-sm text-green-700">
                    Generated: {aiGenerationResult.generated_airfoil.airfoil_name}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Confidence: {(aiGenerationResult.generation_metadata.confidence_score * 100).toFixed(1)}%</div>
                    <div>Novelty: {(aiGenerationResult.generation_metadata.design_novelty * 100).toFixed(1)}%</div>
                  </div>
                </div>
              )}

              <Button onClick={handleGenerateAI} className="w-full" disabled={isGenerating}>
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Airfoil"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
