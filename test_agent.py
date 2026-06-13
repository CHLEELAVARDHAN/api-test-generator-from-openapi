import os
import re
import ast
import json
import logging
from typing import Dict, Any

from validator import validate_generated_pytest_ast

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestGenerationAgent:
    """
    Agent responsible for generating robust pytest test suites
    using the Gemini API, validating them via an AST parser,
    and self-correcting any syntax errors.
    """

    def __init__(self, prompt_filename: str = "prompts/prompt_test_gen.txt"):
        self.prompt_filename = prompt_filename
        self.api_key = os.environ.get("GEMINI_API_KEY")

    def load_prompt_template(self) -> str:
        """
        Loads the prompt template from the filesystem.
        Uses a hardcoded fallback if the file does not exist.
        """
        if os.path.exists(self.prompt_filename):
            try:
                with open(self.prompt_filename, "r", encoding="utf-8") as f:
                    return f.read()
            except IOError as e:
                logger.error(f"Error reading prompt file {self.prompt_filename}: {e}")

        return (
            "You are an expert QA Automation Engineer.\n"
            "Generate a complete Python pytest test suite for the following API.\n\n"
            "API Name: {api_name}\n"
            "Endpoint: {endpoint}\n"
            "Schema:\n{schema}\n\n"
            "Requirements:\n"
            "1. Write a Happy Path Test\n"
            "2. Write a Missing Required Field Test\n"
            "3. Write an Invalid Data Type Test\n"
            "4. Write an Authentication Missing Test\n\n"
            "Output ONLY raw Python code wrapped in a python code block.\n"
            "{error_feedback}"
        )

    def build_prompt(self, api_name: str, endpoint: str, schema: Dict[str, str], error_feedback: str = "") -> str:
        """
        Constructs the final prompt string by injecting data and optional error feedback into the template.
        """
        template = self.load_prompt_template()
        
        feedback_section = ""
        if error_feedback:
            feedback_section = f"\n\nCRITICAL FIX REQUIRED: Your previous code failed with the following syntax error:\n{error_feedback}\nPlease correct the syntax and return the full fixed suite."

        prompt = template.replace("{api_name}", api_name)
        prompt = prompt.replace("{endpoint}", endpoint)
        prompt = prompt.replace("{schema}", json.dumps(schema, indent=2))
        prompt = prompt.replace("{error_feedback}", feedback_section)
        
        return prompt

    def call_gemini(self, prompt: str) -> str:
        """
        Invokes the Gemini 2.5 Flash model with the constructed prompt.
        """
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not set. API calls will likely fail unless authenticated via default credentials.")
            
        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini API request failed: {e}")
            raise e

    def extract_python_code(self, raw_text: str) -> str:
        """
        Extracts raw Python code from Markdown formatting.
        """
        match = re.search(r'```python\s*(.*?)\s*```', raw_text, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()
            
        match_generic = re.search(r'```\s*(.*?)\s*```', raw_text, re.DOTALL)
        if match_generic:
            return match_generic.group(1).strip()
            
        return raw_text.strip()

    def retry_on_ast_failure(self, api_name: str, endpoint: str, schema: Dict[str, str], max_retries: int = 3) -> Dict[str, Any]:
        """
        Core loop: generates code, validates its AST, and retries if it finds syntax errors.
        """
        error_feedback = ""
        last_generated_code = ""

        for attempt in range(1, max_retries + 1):
            logger.info(f"Test Generation Attempt {attempt}/{max_retries} for {api_name}")
            
            prompt = self.build_prompt(api_name, endpoint, schema, error_feedback)
            
            try:
                raw_response = self.call_gemini(prompt)
                code = self.extract_python_code(raw_response)
                last_generated_code = code
                
                if validate_generated_pytest_ast(code):
                    logger.info("AST Validation Successful.")
                    return {
                        "generated_code": code,
                        "ast_valid": True,
                        "attempts": attempt
                    }
                else:
                    try:
                        ast.parse(code)
                        error_text = "Unknown AST syntax parsing failure."
                    except SyntaxError as e:
                        error_text = f"SyntaxError on line {e.lineno}: {e.msg}\nCode element: {e.text}"
                    
                    error_feedback = error_text
                    logger.warning(f"AST Validation Failed on attempt {attempt}: {error_text}")
                    
            except Exception as e:
                logger.error(f"Exception during code generation sequence: {e}")
                error_feedback = f"System Error occurred: {str(e)}"

        logger.error("Failed to generate AST-valid code within maximum retries.")
        return {
            "generated_code": last_generated_code,
            "ast_valid": False,
            "attempts": max_retries
        }

    def generate_test_suite(self, api_name: str, endpoint: str, schema: Dict[str, str]) -> Dict[str, Any]:
        """
        Main entry point for generating the complete test suite.
        """
        return self.retry_on_ast_failure(api_name, endpoint, schema)


def main():
    """
    Example usage execution block.
    """
    schema = {
        "email": "string",
        "password": "string"
    }
    
    agent = TestGenerationAgent()
    
    if not os.environ.get("GEMINI_API_KEY"):
        logger.warning("No API key defined. Cannot run full API test against external service.")
        
    try:
        result = agent.generate_test_suite(
            api_name="Login API",
            endpoint="/api/v1/login",
            schema=schema
        )
        print("Final Output Payload:")
        print(json.dumps({
            "ast_valid": result["ast_valid"],
            "attempts": result["attempts"]
        }, indent=2))
        print("\n--- GENERATED CODE ---\n")
        print(result["generated_code"])
    except Exception as e:
        logger.error(f"Test agent execution halted: {e}")

if __name__ == "__main__":
    main()
