export interface Variable {
  group: string;
  originalName: string;
  variable: string;
  entity: string;
  cardinality: string;
  getValueFrom: string;
  admissibleValues: string[];
  comments: string;
}
