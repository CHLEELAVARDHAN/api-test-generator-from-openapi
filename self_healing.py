import os
import json
import logging
from typing import Dict, Any, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SelfHealingAgent:
    """
    Agent responsible for auto-correcting JSON payloads against a given schema.
    """
    
    def __init__(self, schema: Dict[str, str]):
        self.schema = schema
        self.api_key = os.environ.get("GEMINI_API_KEY")

    def auto_fix_missing_fields(self, payload: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
        """
        Populates missing fields with deterministic default values.
        """
        healed_payload = payload.copy()
        healing_applied = False
        
        for field, expected_type in self.schema.items():
            if field not in healed_payload:
                expected_type = expected_type.lower()
                healing_applied = True
                if expected_type == 'string':
                    healed_payload[field] = "sample_text"
                elif expected_type == 'integer':
                    healed_payload[field] = 0
                elif expected_type in ('float', 'number'):
                    healed_payload[field] = 0.0
                elif expected_type == 'boolean':
                    healed_payload[field] = False
                else:
                    healed_payload[field] = None
                    
        return healed_payload, healing_applied

    def auto_fix_type_mismatches(self, payload: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
        """
        Attempts to deterministically coerce type mismatches.
        """
        healed_payload = payload.copy()
        healing_applied = False
        
        for field, expected_type in self.schema.items():
            if field not in healed_payload:
                continue
                
            value = healed_payload[field]
            expected_type = expected_type.lower()
            
            if expected_type == 'string':
                if not isinstance(value, str):
                    healed_payload[field] = str(value)
                    healing_applied = True
                    
            elif expected_type == 'integer':
                if isinstance(value, bool):
                    healed_payload[field] = int(value)
                    healing_applied = True
                elif not isinstance(value, int):
                    try:
                        healed_payload[field] = int(value)
                        healing_applied = True
                    except (ValueError, TypeError):
                        pass
                        
            elif expected_type in ('float', 'number'):
                if isinstance(value, bool):
                    healed_payload[field] = float(value)
                    healing_applied = True
                elif not isinstance(value, float) and not isinstance(value, int):
                    try:
                        healed_payload[field] = float(value)
                        healing_applied = True
                    except (ValueError, TypeError):
                        pass
                        
            elif expected_type == 'boolean':
                if not isinstance(value, bool):
                    if str(value).lower() in ("true", "1", "yes"):
                        healed_payload[field] = True
                        healing_applied = True
                    elif str(value).lower() in ("false", "0", "no"):
                        healed_payload[field] = False
                        healing_applied = True
                        
        return healed_payload, healing_applied

    def invoke_gemini_healer(self, payload: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
        """
        Invokes the Gemini API to heal payloads that couldn't be fixed deterministically.
        """
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found. Skipping Gemini healing.")
            return payload, False
            
        try:
            from google import genai
            from google.genai import types
            
            client = genai.Client(api_key=self.api_key)
            prompt = (
                f"You are a self-healing JSON agent.\n"
                f"Given the schema: {json.dumps(self.schema)}\n"
                f"Fix the invalid payload: {json.dumps(payload)}\n"
                f"Return ONLY valid JSON."
            )
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            healed_data = json.loads(response.text)
            return healed_data, True
            
        except Exception as e:
            logger.error(f"Gemini API healing failed: {e}")
            return payload, False

    def heal_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Applies the full healing pipeline.
        """
        current_payload = payload.copy()
        overall_healing_applied = False
        remaining_errors = []
        
        current_payload, missing_healed = self.auto_fix_missing_fields(current_payload)
        if missing_healed:
            overall_healing_applied = True
            
        current_payload, type_healed = self.auto_fix_type_mismatches(current_payload)
        if type_healed:
            overall_healing_applied = True
            
        has_remaining = False
        for field, exp_type in self.schema.items():
            val = current_payload.get(field)
            exp_t = exp_type.lower()
            if exp_t == "string" and not isinstance(val, str): has_remaining = True
            elif exp_t == "integer" and (isinstance(val, bool) or not isinstance(val, int)): has_remaining = True
            elif exp_t in ("float", "number") and (isinstance(val, bool) or not isinstance(val, (int, float))): has_remaining = True
            elif exp_t == "boolean" and not isinstance(val, bool): has_remaining = True
            
        if has_remaining:
            current_payload, gemini_healed = self.invoke_gemini_healer(current_payload)
            if gemini_healed:
                overall_healing_applied = True
                
        for field, exp_type in self.schema.items():
            if field not in current_payload:
                remaining_errors.append(f"Missing field: {field}")
            else:
                val = current_payload[field]
                exp_t = exp_type.lower()
                if exp_t == "string" and not isinstance(val, str): 
                    remaining_errors.append(f"Expected string for {field}")
                elif exp_t == "integer" and (isinstance(val, bool) or not isinstance(val, int)): 
                    remaining_errors.append(f"Expected integer for {field}")
                elif exp_t in ("float", "number") and (isinstance(val, bool) or not isinstance(val, (int, float))): 
                    remaining_errors.append(f"Expected float for {field}")
                elif exp_t == "boolean" and not isinstance(val, bool): 
                    remaining_errors.append(f"Expected boolean for {field}")

        return {
            "healed_payload": current_payload,
            "healing_applied": overall_healing_applied,
            "remaining_errors": remaining_errors
        }

def main():
    schema = {
        "email": "string",
        "password": "string",
        "age": "integer"
    }
    
    agent = SelfHealingAgent(schema)
    sample_payload = {
        "email": 123,
        "password": True,
        "age": "25"
    }
    
    result = agent.heal_payload(sample_payload)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
