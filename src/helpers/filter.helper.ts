import { FieldMap, MultiNested, NestedObject } from '../types';
import {
  buildComparison,
  parseFilter,
  transformField,
  transformNestedField,
} from './value.helper';

export function buildWhereClause(filters: string[], isAdvanced = false): any {
  let whereClause: any = {};

  const filterSet = separateFilters([...new Set(filters)]);
  const { simpleFilters, combinedFilters } = filterSet;

  console.log('Filters', filterSet);

  if (combinedFilters.length > 0) {
    const currentWhere = parseCombinedFilter(combinedFilters, isAdvanced);

    whereClause = { ...whereClause, ...currentWhere };
  }

  simpleFilters.forEach((filterElement) => {
    const { field, operator, value } = parseFilter(filterElement);

    // Handle nested fields for advanced filters only
    if (isAdvanced && field.includes('.')) {
      const fieldParts = field.split('.');
      const comparison = buildComparison(operator, value);

      const currentWhere: NestedObject = transformNestedField(
        fieldParts,
        comparison,
      );

      whereClause = { ...whereClause, ...currentWhere };
    } else {
      whereClause[field] = buildComparison(operator, value);
    }
  });

  return whereClause;
}

function separateFilters(filters: string[]) {
  const simpleFilters: string[] = [];
  const combinedFilters: MultiNested[] = [];

  const fieldMap: FieldMap = {};

  filters.forEach((filter) => {
    const { field } = parseFilter(filter);

    if (!fieldMap[field]) {
      fieldMap[field] = [];
    }
    fieldMap[field].push(filter);
  });

  Object.keys(fieldMap).forEach((field) => {
    const nestedLevel = (field.match(/\./g) || []).length;
    if (fieldMap[field].length === 1) {
      simpleFilters.push(fieldMap[field][0]);
    } else {
      combinedFilters.push({ nestedLevel, value: fieldMap[field] });
    }
  });

  return { simpleFilters, combinedFilters };
}

export function parseCombinedFilter(combinedFilters, isAdvanced = false) {
  let whereClause = {};

  combinedFilters.forEach((combinedElement) => {
    const { nestedLevel, value } = combinedElement;

    let currentWhere: NestedObject = whereClause;

    if (isAdvanced) {
      const combinedElementValue = value.map((filterItem) => {
        const { field, operator, value } = parseFilter(filterItem);

        const fieldParts = field.split('.');

        const comparison = buildComparison(operator, value);

        return transformNestedField(fieldParts, comparison, nestedLevel);
      });

      const { field } = parseFilter(value[0]);
      const fieldParts = field.split('.').slice(0, nestedLevel);

      fieldParts.reduce((acc, key, index) => {
        acc[key] = { is: {} };
        if (fieldParts.length - 1 === index)
          acc[key] = { is: { AND: combinedElementValue } };
        return acc[key].is;
      }, currentWhere);
    } else {
      const combinedValue = value.map((filterItem) => {
        const { operator, value } = parseFilter(filterItem);

        const comparison = buildComparison(operator, value);

        return comparison;
      });
      const { field } = parseFilter(value[0]);
      currentWhere = transformField(combinedValue, field);
    }

    whereClause = { ...whereClause, ...currentWhere };
  });
  return whereClause;
}

export function checkSortElement(sortElement: string) {
  const orders = ['desc', 'asc', 'DESC', 'ASC'];

  const [, order] = sortElement.split('=');

  if (!sortElement.includes('=') || !orders.includes(order)) {
    throw Error(
      `Invalid sort format: expected "field=order". Values available ${orders}`,
    );
  }
}
