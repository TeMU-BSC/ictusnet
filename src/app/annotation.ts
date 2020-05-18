export interface Annotation {
  id: string;
  entity: string;
  offset: {
    start: number;
    end: number;
  };
  span: string;
}
