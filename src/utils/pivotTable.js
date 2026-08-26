const toArray = (value) => (Array.isArray(value) ? value : [value]);

const compactUnique = (values) => [
  ...new Set(values.filter((value) => value != null && value !== "")),
];

// Normalize agg so its outer index always corresponds to the same index in value.
// Examples:
//   value: ["a", "b"], agg: "sum"                  => [["sum"], ["sum"]]
//   value: ["a", "b"], agg: ["sum", "avg"]       => [["sum"], ["avg"]]
//   value: ["a", "b"], agg: [["sum", "avg"], ["max"]]
//                                                    => [["sum", "avg"], ["max"]]
//   value: "a", agg: ["sum", "avg"]               => [["sum", "avg"]]
export const normalizeAggConfig = (value, agg = "count") => {
  const values = toArray(value);

  if (!Array.isArray(agg)) {
    return values.map(() => compactUnique([agg]));
  }

  if (values.length === 1) {
    const singleValueAggs =
      agg.length === 1 && Array.isArray(agg[0]) ? agg[0] : agg;

    return [compactUnique(singleValueAggs)];
  }

  return values.map((_, index) =>
    compactUnique(Array.isArray(agg[index]) ? agg[index] : [agg[index]]),
  );
};

export default function pivotTable(
  data,
  { agg = "count", derived = {}, column, value, rows },
) {
  const pivot = {};
  const columnsSet = new Set();

  const values = toArray(value);
  const aggsByValue = normalizeAggConfig(value, agg);
  const valueAggPairs = values.flatMap((valueField, valueIndex) =>
    aggsByValue[valueIndex].map((aggFunc) => [valueField, aggFunc]),
  );

  const rowKeyFn = (item) => rows.map((r) => item[r]).join("||");

  function createStats() {
    return {
      numericCount: 0,
      max: -Infinity,
      min: Infinity,
      count: 0,
      sum: 0,
    };
  }

  function finalizeAgg(stats, aggName) {
    switch (aggName) {
      case "sum":
        return stats.sum;

      case "avg":
        return stats.numericCount ? stats.sum / stats.numericCount : 0;

      case "min":
        return stats.min === Infinity ? 0 : stats.min;

      case "max":
        return stats.max === -Infinity ? 0 : stats.max;

      case "count":
      default:
        return stats.count;
    }
  }

  for (const item of data) {
    const rKey = rowKeyFn(item);
    const cKey = item[column];

    columnsSet.add(cKey);

    if (!pivot[rKey]) {
      pivot[rKey] = {
        _keys: rows.reduce((acc, r) => {
          acc[r] = item[r];
          return acc;
        }, {}),
      };
    }

    if (!pivot[rKey][cKey]) {
      pivot[rKey][cKey] = {};

      for (const v of values) {
        pivot[rKey][cKey][v] = createStats();
      }
    }

    const cell = pivot[rKey][cKey];

    for (const v of values) {
      const stats = cell[v];
      const rawValue = item[v];
      const val = rawValue === "" || rawValue == null ? NaN : Number(rawValue);

      stats.count += 1;

      if (!isNaN(val)) {
        stats.sum += val;
        stats.numericCount += 1;
        stats.min = Math.min(stats.min, val);
        stats.max = Math.max(stats.max, val);
      }
    }
  }

  const columns = Array.from(columnsSet);

  return Object.values(pivot).map((entry) => {
    const obj = { ...entry._keys };

    for (const c of columns) {
      const cell = entry[c];

      if (!cell) {
        for (const [valueField, aggFunc] of valueAggPairs) {
          obj[`${c}→${valueField}→${aggFunc}`] = 0;
        }

        for (const derivedKey of Object.keys(derived)) {
          obj[`${c}→${derivedKey}`] = 0;
        }

        continue;
      }

      const finalized = {};

      for (const [valueField, aggFunc] of valueAggPairs) {
        if (!finalized[valueField]) finalized[valueField] = {};

        const result = finalizeAgg(cell[valueField], aggFunc);

        finalized[valueField][aggFunc] = result;

        obj[`${c}→${valueField}→${aggFunc}`] = result;
      }

      for (const [derivedKey, fn] of Object.entries(derived)) {
        obj[`${c}→${derivedKey}`] = fn(finalized);
      }
    }

    return obj;
  });
}
