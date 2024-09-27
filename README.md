# Prisma Paginator

`prisma-paginator` A simple and flexible pagination module for Prisma, designed to be used with any Node.js project, including NestJS and Next.js. It provides two methods for paginating Prisma queries: one as a method in a class that extends `PrismaClientPaginated`, and another as a standalone paginate function.

## Installation

Install the module via npm:

```bash
$ npm install prisma-paginator
```

## Usage

### 1. PrismaClientPaginated Class

The `PrismaClientPaginated` class extends `PrismaClient` and adds a `paginate` method. This method can be used to paginate queries on any Prisma model.

```ts
import { PrismaClient } from "@prisma/client";
import { paginate } from "prisma-paginator";

const prisma = new PrismaClient();

async function getPaginatedUsers() {
  const pageOption = {
    page: 1,
    size: 10,
    sort: ["name=asc"],
    route: "/users",
  };

  const paginatedUsers = await paginate(prisma, "user", pageOption);
  console.log(paginatedUsers);
}

getPaginatedUsers();
```

### 2. paginate Function

The `paginate` function provides the same pagination functionality but can be used independently of the `PrismaClientPaginated` class. It requires a `PrismaClient` instance as the first parameter.

```ts
import { PrismaClient } from "@prisma/client";
import { paginate } from "prisma-paginator";

const prisma = new PrismaClient();

async function getPaginatedUsers() {
  const pageOption = {
    page: 1,
    size: 10,
    sort: ["name=asc"],
    route: "/users",
  };

  const paginatedUsers = await paginate(prisma, "user", pageOption);
  console.log(paginatedUsers);
}

getPaginatedUsers();
```

## API

### PrismaClientPaginated.paginate

#### Parameters

- model (string): The name of the Prisma model to paginate.
- pageOption (PageOption): Options for pagination.
- prismaParams (PrismaParams, optional): Additional Prisma query parameters.

#### Returns

- Promise<Page<T>>: A promise that resolves to a paginated result.

### paginate

#### Parameters

- prisma (PrismaClient): An instance of PrismaClient.
- model (string): The name of the Prisma model to paginate.
- pageOption (PageOption): Options for pagination.
- prismaParams (PrismaParams, optional): Additional Prisma query parameters.

#### Returns

- Promise<Page<T>>: A promise that resolves to a paginated result.

## Types

### PageOption

```ts
interface PageOption {
  page?: number;
  size?: number;
  filter?: any[];
  nestedFilter?: any[];
  sort?: string[];
  route?: string;
}
```

### PrismaParams

```ts
interface PrismaParams {
  sort?: any;
  where?: any;
  select?: any;
  include?: any;
}
```

### Page

```ts
interface Page<T> {
  content: T[];
  metaData: {
    page: number;
    size: number;
    totalPages: number;
    sort?: any[];
  };
  links?: {
    first: string;
    prev: string;
    next: string;
    last: string;
  };
}
```

## License

This project is licensed under the MIT License.
