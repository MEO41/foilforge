import pandas as pd
import numpy as np
import os

def load_airfoil_data():
    """Load airfoil data from parquet file"""
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'airfoil_data.parquet')
    try:
        df = pd.read_parquet(data_path)
        return df
    except FileNotFoundError:
        raise FileNotFoundError(f"Airfoil data file not found at {data_path}")

def normalize_features(df, targets):
    """Normalize features for similarity calculation"""
    features = ['reynolds_number', 'angle_of_attack', 'cl', 'cd', 'cm', 'cl_cd_ratio']
    normalized_df = df.copy()
    normalized_targets = {}
    
    for feature in features:
        if feature in df.columns:
            # Handle potential division by zero or invalid values
            feature_values = df[feature].replace([np.inf, -np.inf], np.nan).dropna()
            
            if len(feature_values) > 0:
                min_val = feature_values.min()
                max_val = feature_values.max()
                
                if max_val != min_val:
                    # Min-Max normalization
                    normalized_df[feature] = (df[feature] - min_val) / (max_val - min_val)
                    normalized_targets[feature] = (targets[feature] - min_val) / (max_val - min_val)
                else:
                    # If all values are the same, set to 0
                    normalized_df[feature] = 0
                    normalized_targets[feature] = 0
            else:
                normalized_df[feature] = 0
                normalized_targets[feature] = 0
    
    return normalized_df, normalized_targets

def calculate_similarity_score(row, targets, weights):
    """Calculate weighted similarity score for a single airfoil"""
    features = ['reynolds_number', 'angle_of_attack', 'cl', 'cd', 'cm', 'cl_cd_ratio']
    
    total_score = 0
    feature_scores = {}
    
    for feature in features:
        if feature in targets and feature in weights:
            # Calculate absolute difference
            diff = abs(row[feature] - targets[feature])
            # Weight the difference
            weighted_diff = diff * weights[feature]
            total_score += weighted_diff
            feature_scores[feature] = diff
    
    return total_score, feature_scores

def find_best_airfoils(targets, weights, top_n=3):
    """Find the best matching airfoils based on weighted similarity"""
    
    # Load airfoil data
    df = load_airfoil_data()
    
    # Handle missing or infinite values
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.dropna(subset=['reynolds_number', 'angle_of_attack', 'cl', 'cd', 'cm', 'cl_cd_ratio'])
    
    if len(df) == 0:
        return []
    
    # Normalize features
    normalized_df, normalized_targets = normalize_features(df, targets)
    
    # Calculate similarity scores
    results = []
    
    for idx, row in normalized_df.iterrows():
        similarity_score, feature_scores = calculate_similarity_score(
            row, normalized_targets, weights
        )
        
        # Get original row data
        original_row = df.loc[idx]
        
        result = {
            'airfoil_name': str(original_row.get('airfoil_name', '')),
            'airfoil_file': str(original_row.get('airfoil_file', '')),
            'reynolds_number': float(original_row.get('reynolds_number', 0)),
            'angle_of_attack': float(original_row.get('angle_of_attack', 0)),
            'cl': float(original_row.get('cl', 0)),
            'cd': float(original_row.get('cd', 0)),
            'cm': float(original_row.get('cm', 0)),
            'cl_cd_ratio': float(original_row.get('cl_cd_ratio', 0)),
            'geometry': original_row.get('geometry', []) if original_row.get('geometry') is not None else [],
            'airfoil_id': str(original_row.get('airfoil_id', '')),
            'similarity_score': float(similarity_score),
            'feature_scores': {k: float(v) for k, v in feature_scores.items()}
        }
        
        results.append(result)
    
    # Sort by similarity score (lower is better)
    results.sort(key=lambda x: x['similarity_score'])
    
    # Return top N results
    return results[:top_n]