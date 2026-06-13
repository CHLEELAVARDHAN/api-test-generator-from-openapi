import json
import logging
import streamlit as st

from parser import JSONParser
from validator import PayloadValidator
from self_healing import SelfHealingAgent
from test_agent import TestGenerationAgent
from analytics import AnalyticsManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

st.set_page_config(
    page_title="⚡ AI-Powered API Test Generator",
    page_icon="⚡",
    layout="wide"
)

def add_log(msg: str):
    """Appends to the UI action thread."""
    if 'action_logs' not in st.session_state:
        st.session_state.action_logs = []
    st.session_state.action_logs.append(msg)

def render_dashboard(metrics_manager: AnalyticsManager):
    """Displays the metrics at the top or bottom of the screen."""
    metrics = metrics_manager.get_metrics()
    col1, col2, col3, col4, col5 = st.columns(5)
    with col1:
        st.metric("Total APIs Processed", metrics.get("total_apis_processed", 0))
    with col2:
        st.metric("Total Tests Generated", metrics.get("total_tests_generated", 0))
    with col3:
        st.metric("Healing Events", metrics.get("healing_events", 0))
    with col4:
        st.metric("Validation Failures", metrics.get("validation_failures", 0))
    with col5:
        st.metric("AST Success Count", metrics.get("ast_success_count", 0))

def get_schema_for_api(api_name: str) -> dict:
    schemas = {
        "Login API": {
            "email": "string",
            "password": "string"
        },
        "Registration API": {
            "name": "string",
            "email": "string",
            "phone": "string",
            "password": "string"
        },
        "Product API": {
            "product_name": "string",
            "price": "float",
            "quantity": "integer"
        },
        "Payment API": {
            "amount": "float",
            "card_number": "string"
        },
        "Student API": {
            "roll_no": "string",
            "branch": "string",
            "year": "integer"
        }
    }
    return schemas.get(api_name, {})

def main():
    st.title("⚡ AI-Powered API Test Generator")

    analytics = AnalyticsManager()
    
    if 'action_logs' not in st.session_state:
        st.session_state.action_logs = []

    st.sidebar.header("Configuration")
    selected_api = st.sidebar.selectbox("API Selector", [
        "Login API",
        "Registration API",
        "Product API",
        "Payment API",
        "Student API"
    ])
    
    schema = get_schema_for_api(selected_api)
    
    # Render main columns layout
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.subheader("JSON Structure Panel")
        st.write("Read-only schema viewer")
        st.json(schema)
        
    with col2:
        st.subheader("Raw JSON Input")
        default_payload = json.dumps({k: "..." for k in schema.keys()}, indent=2)
        raw_payload = st.text_area("Editable Payload", value=default_payload, height=300)
    
    with col3:
        st.subheader("Agentic Action Thread")
        logs_container = st.container(height=300)
    
    st.divider()
    render_dashboard(analytics)
    st.divider()
    
    if st.button("Generate Tests", type="primary"):
        st.session_state.action_logs = []  # clear previous logs
        add_log("[INFO] Loading schema...")
        
        try:
            parser = JSONParser()
            parsed_payload = parser.parse(raw_payload)
            endpoint = "/api/v1/" + selected_api.lower().replace(" ", "-")
            
            add_log("[INFO] Validating payload...")
            validator = PayloadValidator(schema)
            is_valid, errors = validator.validate(parsed_payload)
            
            if not is_valid:
                analytics.increment_validation_failures()
                add_log(f"[INFO] Validation failed... Errors: {errors}")
                add_log("[INFO] Auto healing payload...")
                
                healer = SelfHealingAgent(schema)
                healing_result = healer.heal_payload(parsed_payload)
                
                if healing_result.get("healing_applied"):
                    analytics.increment_healing_events()
                    parsed_payload = healing_result["healed_payload"]
                    add_log("[INFO] Validation passed... (After Healing)")
                else:
                    add_log("[ERROR] Healing failed to fix validation errors.")
            else:
                add_log("[INFO] Validation passed...")
            
            add_log("[INFO] Generating tests...")
            analytics.increment_api_processed()
            test_agent = TestGenerationAgent()
            test_result = test_agent.generate_test_suite(
                api_name=selected_api,
                endpoint=endpoint,
                schema=schema
            )
            
            if test_result.get("ast_valid"):
                add_log("[INFO] AST validation passed...")
                analytics.increment_ast_success()
            else:
                add_log("[WARNING] AST validation failed...")
                
            add_log("[SUCCESS] Test suite generated.")
            analytics.increment_tests_generated(count=4)
            
            st.session_state.generated_code = test_result.get("generated_code", "")
            
        except Exception as e:
            add_log(f"[ERROR] Process failed: {str(e)}")
            logger.error(f"Generation pipeline failure: {e}")
            
    # Update logs visually
    with logs_container:
        if 'action_logs' in st.session_state:
            for log in st.session_state.action_logs:
                if '[SUCCESS]' in log:
                    st.success(log)
                elif '[ERROR]' in log or '[WARNING]' in log:
                    st.error(log)
                else:
                    st.info(log)
                    
    # Output section
    if 'generated_code' in st.session_state and st.session_state.generated_code:
        st.subheader("Generated Pytest Output Panel")
        st.code(st.session_state.generated_code, language="python")
        
        st.download_button(
            label="Download Pytest Suite",
            data=st.session_state.generated_code,
            file_name=f"test_{selected_api.lower().replace(' ', '_')}.py",
            mime="text/x-python"
        )
        
if __name__ == "__main__":
    main()
