from typing import Tuple, List, Dict
from app.utils.beancount_utils import load_beancount_file


class BeancountService:
    """Service for loading and managing beancount files"""
    
    @staticmethod
    def load_file(filepath: str) -> Tuple[List[Dict], List[Dict], List[Dict], List[Dict], List[str]]:
        """Load beancount file and return parsed data"""
        return load_beancount_file(filepath)

