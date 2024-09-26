import { BadRequestException } from '@nestjs/common';
import { NestedObject } from '../types/filter.type';

// createdAt: { gte: fromDateNew, lte: toDateNew },
export function transformNestedField(
  fieldParts: string[],
  comparison,
  nestedLevel?: number,
) {
  const currentWhere: NestedObject = {};

  const parts = !nestedLevel ? fieldParts : fieldParts.slice(nestedLevel);

  parts.reduce((acc, key, index) => {
    acc[key] = { is: {} };
    if (parts.length - 1 === index) acc[key] = comparison;
    return acc[key].is;
  }, currentWhere);

  return currentWhere;
}

export function transformField(array, field: string) {
  const combinedObject = {};
  combinedObject[field] = {};

  array.forEach((obj) => {
    Object.assign(combinedObject[field], obj);
  });

  return combinedObject;
}

export function extractOperator(input: string): string | null {
  // Define the regular expression pattern
  const pattern = /(?:==|!=|<=|>=|>>|<<|\[\])/;

  // Find the first occurrence of the pattern
  const match = input.match(pattern);

  if (match) return match[0];

  return null;
}
function parseValue(value: any): any {
  if (value.toLowerCase() === 'true') {
    return true;
  } else if (value.toLowerCase() === 'false') {
    return false;
  } else if (!isNaN(Number(value))) {
    return Number(value);
  } else if (value.toLowerCase() === 'null') {
    return null;
  } else {
    return value;
  }
}

export function parseFilter(filter: string): {
  field: string;
  operator: string;
  value: any;
} {
  const pattern = /(?:==|!=|<=|>=|>>|<<|\[\])/;
  const operators = ['==', '!=', '<=', '>=', '<<', '>>', '[]'];
  const parts = filter.split(pattern);

  const operator = extractOperator(filter);

  if (parts.length !== 2)
    throw new BadRequestException(
      `Invalid filter format: expected 'field<operator>value'. Operators available ${operators}`,
    );

  const field = parts[0].trim();
  // Default to equality for basic filters
  const value = parseValue(parts[1].trim());

  return { field, operator, value };
}

export function buildComparison(operator: string, value: any): any {
  let test: any;
  switch (operator.toLowerCase()) {
    case '==':
      test = value;
      break;
    case '!=':
      test = value;
      break;
    case '>>':
      test = { gt: value };
      break;
    case '>=':
      test = { gte: value };
      break;
    case '<<':
      test = { lt: value };
      break;
    case '<=':
      test = { lte: value };
      break;
    case '[]':
      test = { in: value };
      break;
  }
  if (operator === '!=') test = { NOT: test };
  return test;
}
