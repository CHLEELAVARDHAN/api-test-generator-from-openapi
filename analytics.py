import logging
import streamlit as st
from typing import Dict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnalyticsManager:
    """
    Manages session state metrics for the API Test Generator dashboard.
    """

    def __init__(self):
        self.initialize_metrics()

    def initialize_metrics(self) -> None:
        """
        Safely initializes metrics in Streamlit's session state.
        """
        try:
            if 'metrics' not in st.session_state:
                st.session_state.metrics = {
                    "total_apis_processed": 0,
                    "total_tests_generated": 0,
                    "healing_events": 0,
                    "validation_failures": 0,
                    "ast_success_count": 0
                }
        except Exception as e:
            logger.error(f"Failed to initialize metrics in session state: {e}")

    def increment_api_processed(self) -> None:
        """Increments the count of total APIs processed."""
        try:
            if 'metrics' in st.session_state:
                st.session_state.metrics["total_apis_processed"] += 1
        except Exception as e:
            logger.error(f"Error incrementing API processed metric: {e}")

    def increment_tests_generated(self, count: int = 4) -> None:
        """Increments the total tests generated count."""
        try:
            if 'metrics' in st.session_state:
                st.session_state.metrics["total_tests_generated"] += count
        except Exception as e:
            logger.error(f"Error incrementing tests generated metric: {e}")

    def increment_healing_events(self) -> None:
        """Increments the healing events counter."""
        try:
            if 'metrics' in st.session_state:
                st.session_state.metrics["healing_events"] += 1
        except Exception as e:
            logger.error(f"Error incrementing healing events metric: {e}")

    def increment_validation_failures(self) -> None:
        """Increments the validation failures counter."""
        try:
            if 'metrics' in st.session_state:
                st.session_state.metrics["validation_failures"] += 1
        except Exception as e:
            logger.error(f"Error incrementing validation failures metric: {e}")

    def increment_ast_success(self) -> None:
        """Increments the AST success validation counter."""
        try:
            if 'metrics' in st.session_state:
                st.session_state.metrics["ast_success_count"] += 1
        except Exception as e:
            logger.error(f"Error incrementing AST success metric: {e}")

    def get_metrics(self) -> Dict[str, int]:
        """
        Retrieves the current metrics from the session state.
        Returns empty dictionary if state is missing.
        """
        try:
            return st.session_state.get('metrics', {})
        except Exception as e:
            logger.error(f"Error retrieving metrics: {e}")
            return {}
