export interface Annotation {
  id: string;
  entity: string;
  offset: {
    start: number;
    end: number;
  };
  span: string;
  notes: string;
}

export interface Variable {
  key: string;
  group: string;
  label: string;
  entity: string;
  cardinality: string;
  getValueFrom: string;
  admissibleValues: string[];
  comments: string;
}
