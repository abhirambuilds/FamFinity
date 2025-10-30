"""
Create stub model files for smoke check purposes.

These are minimal placeholder models that allow the system to pass smoke checks
while real models are trained separately with proper data.
"""
import os
import sys
import pickle
import numpy as np

# Add backend to path
SCRIPT_DIR = os.path.dirname(__file__)
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, os.path.join(REPO_ROOT, "backend"))

import torch
from torch import nn


class StubLSTMPredictor(nn.Module):
    """Minimal LSTM predictor for stub purposes"""
    def __init__(self, input_size=1, hidden_size=32, num_layers=1):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)
    
    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])


def create_stub_predictor(output_path: str):
    """Create a minimal trained predictor model"""
    model = StubLSTMPredictor()
    
    # Initialize with some random weights (simulating training)
    for param in model.parameters():
        if param.dim() > 1:
            nn.init.xavier_uniform_(param)
    
    # Save the model
    torch.save(model.state_dict(), output_path)
    print(f"✓ Created stub predictor model: {output_path}")


def create_stub_recommender(output_path: str):
    """Create a minimal recommender model"""
    # Simple dictionary-based recommender
    stub_recommender = {
        'categories': [
            'groceries', 'dining', 'utilities', 'transport', 
            'entertainment', 'healthcare', 'shopping', 'other'
        ],
        'rules': {
            'groceries': 'Plan weekly meals and buy store brands',
            'dining': 'Limit dining-out to weekends',
            'utilities': 'Use energy-saving settings',
            'transport': 'Combine trips to save fuel',
            'entertainment': 'Look for free/discount options',
            'healthcare': 'Use generic medications where possible',
            'shopping': 'Wait 24h before non-essential purchases',
            'other': 'Track and categorize expenses properly'
        },
        'model_type': 'stub',
        'version': '1.0.0-stub'
    }
    
    # Save as pickle
    with open(output_path, 'wb') as f:
        pickle.dump(stub_recommender, f)
    
    print(f"✓ Created stub recommender model: {output_path}")


def main():
    """Create both stub models"""
    models_dir = os.path.join(REPO_ROOT, "backend", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    predictor_path = os.path.join(models_dir, "predictor.pt")
    recommender_path = os.path.join(models_dir, "recommender.pkl")
    
    print("Creating stub models for smoke check purposes...")
    print("(These should be replaced with properly trained models in production)")
    print()
    
    create_stub_predictor(predictor_path)
    create_stub_recommender(recommender_path)
    
    print()
    print("✅ Stub models created successfully!")
    print()
    print("Note: These are minimal placeholder models.")
    print("For production use, train proper models with:")
    print("  python backend/models/train_predictor.py --data data/sample_user.csv")
    print("  python backend/models/train_recommender.py --data data/sample_user.csv")


if __name__ == "__main__":
    main()

