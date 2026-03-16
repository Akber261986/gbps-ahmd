import sys
from pathlib import Path

# Add parent directory to path so we can import main
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from main import app

# Vercel expects a variable named 'app' or 'application'
# This file serves as the entry point for Vercel
