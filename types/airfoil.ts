export interface AirfoilData {
  airfoil_name: string
  airfoil_file: string
  reynolds_number: number
  angle_of_attack: number
  cl: number
  cd: number
  cm: number
  cl_cd_ratio: number
  optimized_cl: number
  optimized_cd: number
  optimized_cm: number
  optimized_cl_cd_ratio: number
  geometry: number[][]
  airfoil_id: string
  similarity:number
}
export interface SimilarityResult {
  airfoil: AirfoilData
  similarity_score: number
}
export interface TargetProperties {
  reynolds_number: number
  angle_of_attack: number
  cl: number
  cd: number
  cm: number
  cl_cd_ratio: number
}

export interface PropertyWeights {
  reynolds_number: number
  angle_of_attack: number
  cl: number
  cd: number
  cm: number
  cl_cd_ratio: number
}



export interface OptimizationResult {
  optimized_airfoil: {
    airfoil_name: string
    geometry: number[][]
    cl: number
    cd: number
    cm: number
    thickness: number
    camber: number
  }
  optimization_history: Array<{
    iteration: number
    fitness: number
  }>
  improvement_metrics: Array<{
    property: string
    original: number
    optimized: number
    improvement_percent: number
  }>
}

export interface OptimizationConfig {
  algorithm: string
  population_size: number
  max_iterations: number
  convergence_tolerance: number
  mutation_rate: number
  crossover_rate: number
}

export interface AIGenerationConfig {
  method: "gan" | "vae" | "diffusion" | "transformer"
  creativity_level: number // 0-1 scale
  constraint_weight: number // 0-1 scale
  seed?: number
}

export interface AIGenerationResult {
  generated_airfoil: AirfoilData
  generation_metadata: {
    method_used: string
    generation_time: number
    confidence_score: number
    design_novelty: number
  }
  predicted_performance: TargetProperties
}
