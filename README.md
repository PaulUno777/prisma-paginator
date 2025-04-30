# Prisma Paginator

`prisma-paginator` is a lightweight and flexible pagination utility for Prisma. It enables clean pagination logic with filtering, sorting, and navigation links, and is ideal for integration into custom `PrismaService` classes—without extending any base class.

## 🚀 Installation

Install the module via npm yarn or pnpm:

```bash
$ npm install prisma-paginator
```

```bash
$ yarn add prisma-paginator
```

```bash
$ pnpm add prisma-paginator
```

## 📦 Usage

### 1. Add `paginate` method to your PrismaService Class

Use `getPaginatorFunc` to bind pagination logic to your Prisma service class:

```ts
import { PrismaClient } from "@prisma/client";
import { getPaginatorFunc } from "prisma-paginator";

//create prima service class
export class PrismaService extends PrismaClient {
  constructor() {
    super({ errorFormat: "pretty", datasourceUrl: "DATABASE_URL" });
  }
  paginate<T>(
    model: string,
    pageOption: PageOption,
    prismaParams?: PrismaParams
  ) {
    const paginateWithClient = getPaginatorFunc(this);
    return paginateWithClient<T>(model, pageOption, prismaParams);
  }

  // Add your custom methods below...
}
```

### Example Usage

```ts
//Can be added via the HTTP requests (body or query)
const pageOption: PageOption = {
  page: 1,
  size: 10,
  sort: ["name=asc"],
  filter: ["isVerified==true", "country==FR"],
};

const prismaService = new PrismaService();

async function getPaginatedUsers(pageOption) {
  const prismaParams: PrismaParams = {
    where: { isAdmin: false },
  };

  const paginatedUsers = await prismaService.paginate(
    "user",
    pageOption,
    prismaParams
  );
  console.log(paginatedUsers);
}

getPaginatedUsers();
```

### 2. `paginate` Function

The standalone `paginate` function can be used independently and directly with a `PrismaClient` instance.

```ts
import { PrismaClient } from "@prisma/client";
import { paginate } from "prisma-paginator";

const prisma = new PrismaClient({
  errorFormat: "pretty",
  datasourceUrl: "DATABASE_URL",
});

const pageOption: PageOption = {
  page: 1,
  size: 10,
  sort: ["name=desc"],
  nestedFilter: ["address.city==Bolingo"],
  route: "/users",
};

async function getPaginatedUsers(pageOption) {
  const paginatedUsers = await paginate(prisma, "user", pageOption);
  console.log(paginatedUsers);
}

getPaginatedUsers();
```

## 🧪 API

### PrismaService.paginate method

#### Parameters

- model (string): The name of the Prisma model.
- pageOption (PageOption): Options for pagination.
- prismaParams (PrismaParams, optional): Additional Prisma syntax query parameters.

#### Returns

- Promise<Page<T>>: A promise that resolves to a paginated result.

### paginate function

#### Parameters

- prisma (PrismaClient): An instance of PrismaClient.
- model (string): The name of the Prisma model.
- pageOption (PageOption): Options for pagination.
- prismaParams (PrismaParams, optional): Additional Prisma query syntax parameters.

#### Returns

- Promise<Page<T>>: A promise that resolves to a paginated result.

## 📘 Types

### PageOption
```ts
interface PageOption {
  page?: number;
  size?: number;
  filter?: string[];
  nestedFilter?: string[];
  sort?: string[];
  route?: string;
}
```

### PrismaParams
```ts
interface PrismaParams {
  where?: unknown;
  select?: unknown;
  include?: unknown;
  orderBy?: unknown;
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
    totalCount: number;
    sort?: unknown[];
  };
  links?: {
    first: string;
    prev: string;
    next: string;
    last: string;
  };
}
```

## 📝 License
This project is licensed under the MIT License.
