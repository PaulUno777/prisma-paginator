export type NestedObject = { [key: string]: NestedObject | any };

export type FieldMap = { [key: string]: string[] };

type MetaData = {
  page: number;
  size: number;
  totalPages: number;
  totalCount: number;
  sort?: Array<{ [key: string]: "asc" | "desc" | string }>;
  filter?: { [key: string]: any };
};

export interface Page<T> {
  content: T[];
  metaData: MetaData;
  links?: Links;
}

export interface PageOption {
  page?: number;
  size?: number;
  sort?: string[];
  filter?: string[];
  nestedFilter?: string[];
  route?: string;
}

export interface PrismaParams {
  where?: unknown;
  include?: unknown;
  select?: unknown;
  orderBy?: unknown;
}

export interface MultiNested {
  nestedLevel: number;
  value: string[];
}

export type Links = {
  first: string;
  prev: string;
  next: string;
  last: string;
};
