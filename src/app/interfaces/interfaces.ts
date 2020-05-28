export interface Annotation {
  id: string;
  entity: string;
  offset: {
    start: number;
    end: number;
  };
  evidence: string;
  notes: string;
}

export interface Variable {
  key: string;
  group: string;
  label: string;
  entity: string;
  cardinality: string;
  getValueFrom: string;
  fieldType: string;
  inputType?: string;
  admissibleValues?: string[];
  comments?: string;
}
