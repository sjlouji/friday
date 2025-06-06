from pathlib import Path

# Project root directory
BASE_PATH = Path(__file__).resolve().parent.parent

# Log files directory
LOG_DIR = BASE_PATH / 'log'

# Static resources directory
STATIC_DIR = BASE_PATH / 'static'

# Upload files directory
UPLOAD_DIR = STATIC_DIR / 'upload'

# Plugin directory
PLUGIN_DIR = BASE_PATH / 'plugin'