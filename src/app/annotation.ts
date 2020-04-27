export interface Annotation {
  id: string;
  category: string;
  offset: {
    start: number;
    end: number;
  };
  span: string;
}
