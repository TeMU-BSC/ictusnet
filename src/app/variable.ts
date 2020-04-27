export interface Variable {
  group: string;
  originalName: string;
  variable: string;
  cardinality: string;
  getValueFrom: string;
  admissibleValues: string[];
  comments: string;
}
