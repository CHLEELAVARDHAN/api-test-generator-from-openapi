import json
import ast
import logging
from typing import Dict, List, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def validate_generated_pytest_ast(code_string: str) -> bool:
    """
    Validates the syntactic correctness of AI-generated pytest scripts 
    using Python's built-in Abstract Syntax Tree parser.
    """
    if not code_string or not isinstance(code_string, str):
        return False
        
    try:
        ast.parse(code_string)
        return True
    except SyntaxError as e:
        logger.error(f"Syntax validation failed for AST: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during AST validation: {e}")
        return False

class PayloadValidator:
    def __init__(self, schema: Dict[str, str]):
        """
        Initialize with a flat schema map definition.
        Example schema: {"email": "string", "password": "string", "age": "integer"}
        """
        if not isinstance(schema, dict):
            raise ValueError("Schema must be a dictionary")
        self.schema = schema

    def check_missing_fields(self, payload: Dict[str, Any]) -> List[str]:
        """
        Checks for missing required fields based on the defined schema.
        Returns a list of missing field names.
        """
        if not isinstance(payload, dict):
            return list(self.schema.keys())
            
        return [field for field in self.schema.keys() if field not in payload]

    def check_type_mismatches(self, payload: Dict[str, Any]) -> Dict[str, str]:
        """
        Checks for type mismatches between the payload and the schema.
        Returns a dictionary mapping field names to type errors.
        """
        if not isinstance(payload, dict):
            return {"payload": "Payload must be a dictionary"}
            
        mismatches = {}
        for field, expected_type in self.schema.items():
            if field not in payload:
                continue
            
            value = payload[field]
            error = self._validate_type(expected_type, value)
            if error:
                mismatches[field] = error
                
        return mismatches
        
    def _validate_type(self, expected_type: str, value: Any) -> str:
        """
        Helper method to map schema type strings to actual Python types.
        Supports: string, integer, float, boolean
        """
        if not isinstance(expected_type, str):
            return "Invalid schema type definition"
            
        expected_type = expected_type.lower()
        
        if expected_type == 'string':
            if not isinstance(value, str):
                return f"Expected string, got {type(value).__name__}"
                
        elif expected_type == 'boolean':
            if not isinstance(value, bool):
                return f"Expected boolean, got {type(value).__name__}"
                
        elif expected_type == 'integer':
            # In Python, bool is a subclass of int, so we must exclude it
            if isinstance(value, bool) or not isinstance(value, int):
                return f"Expected integer, got {type(value).__name__}"
                
        elif expected_type in ('float', 'number'):
            # Allow pure ints to pass as floats
            if isinstance(value, bool) or not (isinstance(value, float) or isinstance(value, int)):
                return f"Expected float, got {type(value).__name__}"
                
        else:
            return f"Unknown expected type: {expected_type}"
            
        return ""

    def validate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform comprehensive validation on the given JSON payload.
        Returns a structured dictionary of validation outcomes.
        """
        if not isinstance(payload, dict):
            return {
                "is_valid": False,
                "errors": {"payload": ["Payload must be a dictionary"]}
            }
            
        missing = self.check_missing_fields(payload)
        mismatches = self.check_type_mismatches(payload)
        
        extra = [field for field in payload.keys() if field not in self.schema]
        
        errors = {}
        if missing:
            errors['missing_fields'] = missing
        if mismatches:
            errors['type_mismatches'] = mismatches
        if extra:
            errors['extra_fields'] = extra
            
        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }

def main():
    schema = {
        "email": "string",
        "password": "string",
        "age": "integer",
        "admin": "boolean"
    }
    validator = PayloadValidator(schema)
    
    sample_payload = {
        "email": "test@example.com",
        "age": True, # Will trigger integer type mismatch
        "admin": 1, # Will trigger boolean type mismatch
        "unrecognized_token": "abc" # Will trigger extra fields
    }
    
    result = validator.validate(sample_payload)
    print(f"Payload Validation Output:\\n{json.dumps(result, indent=2)}")
    
    valid_pytest = "def test_login():\\n    assert True"
    invalid_pytest = "def test_login()\\n    assert True ="
    
    print(f"\\nValid code AST state: {validate_generated_pytest_ast(valid_pytest)}")
    print(f"Invalid code AST state: {validate_generated_pytest_ast(invalid_pytest)}")

if __name__ == "__main__":
    main()
