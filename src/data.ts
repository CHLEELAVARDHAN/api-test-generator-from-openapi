import { ApiDefinition } from './types';

export const apis: ApiDefinition[] = [
  {
    id: "login",
    name: "Login API",
    fields: [
      { name: "email", type: "string" },
      { name: "password", type: "string" }
    ]
  },
  {
    id: "registration",
    name: "Registration API",
    fields: [
      { name: "name", type: "string" },
      { name: "email", type: "string" },
      { name: "phone", type: "string" },
      { name: "password", type: "string" }
    ]
  },
  {
    id: "product",
    name: "Product API",
    fields: [
      { name: "product_name", type: "string" },
      { name: "price", type: "float" },
      { name: "quantity", type: "integer" }
    ]
  },
  {
    id: "payment",
    name: "Payment API",
    fields: [
      { name: "amount", type: "float" },
      { name: "card_number", type: "string" }
    ]
  },
  {
    id: "student",
    name: "Student API",
    fields: [
      { name: "roll_no", type: "string" },
      { name: "branch", type: "string" },
      { name: "year", type: "integer" }
    ]
  }
];

export function generateDynamicPytest(api: ApiDefinition): string {
  const fields = api.fields.map(f => `            "${f.name}": ${f.type === 'string' ? '"value"' : f.type === 'float' ? '0.0' : '0'}`).join(',\n');
  const missingFields = api.fields.slice(1).map(f => `            "${f.name}": ${f.type === 'string' ? '"value"' : f.type === 'float' ? '0.0' : '0'}`).join(',\n');
  const typeInvalidFields = api.fields.map(f => `            "${f.name}": ${f.type === 'string' ? '123' : '"not_a_number"'}`).join(',\n');
  
  return `import pytest
import requests

BASE_URL = "http://api.example.com/v1"

def test_happy_path_${api.id}():
    """Happy Path: valid correct formatted data"""
    payload = {
${fields}
    }
    response = requests.post(f"{BASE_URL}/${api.id}", json=payload)
    assert response.status_code == 200

def test_missing_field_${api.id}():
    """Missing Field: removing a required value"""
    payload = {
${missingFields}
    }
    response = requests.post(f"{BASE_URL}/${api.id}", json=payload)
    assert response.status_code == 400

def test_type_invalid_${api.id}():
    """Invalid Type: breaking types"""
    payload = {
${typeInvalidFields}
    }
    response = requests.post(f"{BASE_URL}/${api.id}", json=payload)
    assert response.status_code == 400

def test_auth_missing_${api.id}():
    """Auth Missing: rejecting without auth headers"""
    payload = {
${fields}
    }
    response = requests.post(f"{BASE_URL}/${api.id}", json=payload)
    # Auth checking assumed blocked
    assert response.status_code == 401
`;
}
