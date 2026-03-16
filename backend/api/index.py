import sys
import os
from pathlib import Path

# Add parent directory to path so we can import main
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Set environment variable to indicate serverless
os.environ['VERCEL'] = '1'

# Import the FastAPI app
from main import app

# Vercel will automatically handle the ASGI interface
# The app variable is what Vercel looks for
