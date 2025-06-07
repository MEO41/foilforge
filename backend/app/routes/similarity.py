import logging
from flask import Blueprint, request, jsonify
from app.services.similarity_search import find_best_airfoils  # legacy, can be removed if refactored
import traceback
import pandas as pd
import numpy as np
from pathlib import Path
import joblib
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

similarity_bp = Blueprint('similarity', __name__)

# --- Constants and Pre-loaded Resources ---
BASE_DIR = Path(__file__).resolve().parent.parent  # Points to the root of `app/`
CACHE_DIR = BASE_DIR / "data"
PARQUET_DIR = CACHE_DIR / "airfoil_data.parquet"
NUM_SCALER_DIR = CACHE_DIR / "num_scaler.gz"

try:
    df = pd.read_parquet(PARQUET_DIR)
    scaler = joblib.load(NUM_SCALER_DIR)
except Exception as e:
    logger.error(f"Failed to load data or scaler: {e}")
    df = None
    scaler = None

NUM_COLS = ["reynolds_number", "angle_of_attack",
            "cl", "cd", "cm", "cl_cd_ratio"]

def weighted_dist_matrix(data: pd.DataFrame,
                         target_vec: np.ndarray,
                         weights: np.ndarray) -> np.ndarray:
    assert target_vec.shape == weights.shape == (len(NUM_COLS),)
    diff2 = (data.values - target_vec)**2
    return np.sqrt(np.dot(diff2, weights))

def auto_alpha(dists, threshold=0.01, percentile=95):
    d = np.percentile(dists, percentile)
    return -np.log(threshold) / d

def similarity_score(dists: np.ndarray,
                     weights: np.ndarray) -> np.ndarray:
    #max_d = dists.max()
    alpha = auto_alpha(dists)  # This gives a good starting alpha
    k = 200 # this K value is for offsetting our alpha to get more interpretibale similarity score
    sim = np.exp(-alpha * k * dists) #The parameter alpha controls how fast similarity decays in this case the value 5 manually givnev
    return (100 * sim).clip(min=0)

@similarity_bp.route('/similarity-search', methods=['POST'])
def similarity_search():
    try:
        logger.info("Received similarity search request. Validating inputs...")

        if df is None or scaler is None:
            raise FileNotFoundError("Required data files could not be loaded.")

        data = request.get_json()
        logger.debug(f"Payload: {data}")

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        if 'targets' not in data or 'weights' not in data:
            return jsonify({'error': 'Missing targets or weights in request'}), 400

        targets_raw = data['targets']
        weights_raw = data['weights']

        for col in NUM_COLS:
            if col not in targets_raw:
                return jsonify({'error': f'Missing target field: {col}'}), 400
            if col not in weights_raw:
                return jsonify({'error': f'Missing weight field: {col}'}), 400

        # Force consistent feature order for scaler
        targets_df = pd.DataFrame([[targets_raw[col] for col in NUM_COLS]], columns=NUM_COLS)
        target_scaled = scaler.transform(targets_df)[0]

        weights = np.array([weights_raw[col] for col in NUM_COLS], dtype=float)
        weights /= weights.sum()

        dists = weighted_dist_matrix(df[NUM_COLS], target_scaled, weights)
        sims = similarity_score(dists, weights)

        df_results = df.copy()
        df_results["distance"] = dists
        df_results["similarity"] = sims

        top3 = df_results.sort_values("distance").head(3).reset_index(drop=True)

        # De-normalize outputs using scaler.inverse_transform
        scaled_vals = top3[NUM_COLS].values
        unscaled_vals = scaler.inverse_transform(scaled_vals)
        for i, col in enumerate(NUM_COLS):
            top3[col] = unscaled_vals[:, i]

        # Parse geometry data from JSON string to array
        top3['geometry'] = top3['geometry'].apply(lambda x: json.loads(x) if isinstance(x, str) else x)

        result_cols = ["airfoil_name"] + NUM_COLS + ["similarity", "distance", "geometry"]

        return jsonify(top3[result_cols].to_dict(orient='records')), 200
    except FileNotFoundError as e:
        logger.error(f"Missing file: {e}")
        return jsonify({'error': str(e)}), 500

    except Exception as e:
        logger.error(f"Unhandled error: {e}")
        logger.debug(traceback.format_exc())
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@similarity_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200
