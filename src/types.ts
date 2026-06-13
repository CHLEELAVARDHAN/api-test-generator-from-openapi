export interface TargetField {
  name: string;
  type: string;
}

export interface ApiDefinition {
  id: string;
  name: string;
  fields: TargetField[];
}

export interface TestStats {
  totalApis: number;
  totalTests: number;
  happyPath: number;
  missingField: number;
  invalidType: number;
  authTests: number;
}

