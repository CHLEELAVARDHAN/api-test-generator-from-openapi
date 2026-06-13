import json
import logging
from typing import Dict, List, Any, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenAPIParser:
    def __init__(self, file_path: Optional[str] = None):
        """
        Initializes the parser.
        Supports passing an optional file path for OpenAPI schemas.
        """
        self.file_path = file_path

    def validate_json_syntax(self, data: str) -> bool:
        """
        Validates if a string is a well-formed JSON object.
        """
        if not data or not isinstance(data, str):
            return False
            
        try:
            json.loads(data)
            return True
        except json.JSONDecodeError as e:
            logger.error(f"JSON Syntax Error: {e}")
            return False

    def extract_endpoints(self, schema: Dict[str, Any]) -> List[str]:
        """
        Extracts all paths/endpoints from a structured OpenAPI schema dictionary.
        Ignores invalid paths without supported HTTP methods.
        """
        endpoints = []
        if not isinstance(schema, dict):
            return endpoints
            
        if 'paths' in schema and isinstance(schema['paths'], dict):
            for path, methods in schema['paths'].items():
                if isinstance(methods, dict) and any(m in methods for m in ['get', 'post', 'put', 'delete', 'patch']):
                    endpoints.append(path)
        return endpoints

    def extract_schema_for_endpoint(self, schema: Dict[str, Any], endpoint: str, method: str = 'post') -> Dict[str, Any]:
        """
        Extracts the expected request schema for a specific endpoint and HTTP method.
        Assumes standard OpenAPI 'requestBody' configuration.
        """
        if not isinstance(schema, dict) or not endpoint:
            return {}
            
        try:
            paths = schema.get('paths', {})
            if not isinstance(paths, dict):
                return {}
                
            method_data = paths.get(endpoint, {}).get(method.lower(), {})
            
            if 'requestBody' in method_data:
                content = method_data['requestBody'].get('content', {})
                if 'application/json' in content:
                    extracted_schema = content['application/json'].get('schema', {})
                    # If it's a direct properties object, return that
                    if 'properties' in extracted_schema:
                        return extracted_schema['properties']
                    return extracted_schema
            return {}
        except Exception as e:
            logger.error(f"Error extracting schema for endpoint {endpoint}: {e}")
            return {}

    def parse_raw_schema(self, raw_json: str) -> Dict[str, str]:
        """
        Parses a flat raw JSON schema mapping field names to data types.
        e.g., {"email": "string", "age": "integer"}
        """
        try:
            data = json.loads(raw_json)
            if not isinstance(data, dict):
                raise ValueError("JSON payload must resolve to a Python dictionary.")
            
            # Ensure all values are strings representing types
            return {str(k): str(v).lower() for k, v in data.items()}
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse raw schema: {e}")
            return {}

def main():
    parser = OpenAPIParser()
    sample_json = '{"email": "string", "password": "string"}'
    
    is_valid = parser.validate_json_syntax(sample_json)
    print(f"Is valid JSON: {is_valid}")
    
    if is_valid:
        parsed_schema = parser.parse_raw_schema(sample_json)
        print(f"Parsed Schema: {parsed_schema}")

if __name__ == "__main__":
    main()
