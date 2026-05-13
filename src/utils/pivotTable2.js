export default function pivotTable(
  data,
  { agg = "count", derived = {}, column, value, rows },
) {
  const pivot = {};
  const columnsSet = new Set();

  const values = Array.isArray(value) ? value : [value];

  const aggs = Array.isArray(agg) ? agg : [agg];

  const rowKeyFn = (item) => rows.map((r) => item[r]).join("||");

  function createStats() {
    return {
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
        return stats.count ? stats.sum / stats.count : 0;

      case "min":
        return stats.min === Infinity ? 0 : stats.min;

      case "max":
        return stats.max === -Infinity ? 0 : stats.max;

      case "count":
      default:
        return stats.count;
    }
  }

  // =========================
  // BUILD AGGREGATION CUBE
  // =========================

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
      const val = Number(item[v]);
      const stats = cell[v];

      if (!isNaN(val)) {
        stats.sum += val;
        stats.count += 1;
        stats.min = Math.min(stats.min, val);
        stats.max = Math.max(stats.max, val);
      } else {
        stats.count += 1;
      }
    }
  }

  const columns = Array.from(columnsSet);

  // =========================
  // BUILD FINAL OUTPUT
  // =========================

  return Object.values(pivot).map((entry) => {
    const obj = { ...entry._keys };

    for (const c of columns) {
      const cell = entry[c];

      // no data for this pivot column
      if (!cell) {
        for (const v of values) {
          for (const a of aggs) {
            obj[`${c}→${v}→${a}`] = 0;
          }
        }

        for (const derivedKey of Object.keys(derived)) {
          obj[`${c}→${derivedKey}`] = 0;
        }

        continue;
      }

      // =========================
      // STANDARD AGGS
      // =========================

      const finalized = {};

      for (const v of values) {
        finalized[v] = {};

        for (const a of aggs) {
          const result = finalizeAgg(cell[v], a);

          finalized[v][a] = result;

          obj[`${c}→${v}→${a}`] = result;
        }
      }

      // =========================
      // DERIVED METRICS
      // =========================

      for (const [derivedKey, fn] of Object.entries(derived)) {
        obj[`${c}→${derivedKey}`] = fn(finalized);
      }
    }

    return obj;
  });
}
