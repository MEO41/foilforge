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
  optimization_history: {
    iterations: number
    best_fitness: number
  }
}

export interface OptimizationConfig {
  algorithm: string
  population_size: number
  max_iterations: number
  convergence_tolerance: number
  mutation_rate: number
  crossover_rate: number
}
