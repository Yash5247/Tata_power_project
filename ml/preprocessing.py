"""Data loading and preprocessing for AI4I 2020 dataset."""
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ml.config import (
    CATEGORICAL_COLS,
    DATA_PATH,
    FEATURE_COLS,
    RANDOM_STATE,
    TARGET_COL,
    TEST_SIZE,
)


def load_dataset(path=None) -> pd.DataFrame:
    """Load and clean the AI4I 2020 predictive maintenance dataset."""
    path = path or DATA_PATH
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip()

    drop_cols = ["UDI", "Product ID"]
    df = df.drop(columns=[c for c in drop_cols if c in df.columns], errors="ignore")
    return df


def build_preprocessor() -> ColumnTransformer:
    """Build sklearn preprocessor for numeric and categorical features."""
    numeric_features = FEATURE_COLS
    categorical_features = CATEGORICAL_COLS

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(drop="first", sparse_output=False), categorical_features),
        ]
    )
    return preprocessor


def get_feature_names(preprocessor: ColumnTransformer) -> list[str]:
    """Return transformed feature names from fitted preprocessor."""
    cat_encoder = preprocessor.named_transformers_["cat"]
    cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_COLS))
    return FEATURE_COLS + cat_names


def prepare_data(df: pd.DataFrame | None = None):
    """Split dataset into train/test with features and target."""
    if df is None:
        df = load_dataset()

    X = df[FEATURE_COLS + CATEGORICAL_COLS]
    y = df[TARGET_COL]

    return train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
