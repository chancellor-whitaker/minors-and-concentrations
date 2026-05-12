export default function pivotTable(
  data,
  { agg = "count", column, value, rows },
) {
  const pivot = {};
  const columnsSet = new Set();

  const values = Array.isArray(value) ? value : [value];

  const rowKeyFn = (item) => rows.map((r) => item[r]).join("||");

  function createStats() {
    return {
      max: -Infinity,
      min: Infinity,
      count: 0,
      sum: 0,
    };
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
      const val = Number(item[v]);

      if (!isNaN(val)) {
        cell[v].sum += val;
        cell[v].count += 1;
        cell[v].min = Math.min(cell[v].min, val);
        cell[v].max = Math.max(cell[v].max, val);
      } else {
        cell[v].count += 1;
      }
    }
  }

  const columns = Array.from(columnsSet);

  return Object.values(pivot).map((entry) => {
    const obj = { ...entry._keys };

    for (const c of columns) {
      const cell = entry[c];

      for (const v of values) {
        const key = `${c}→${v}`;

        if (!cell) {
          obj[key] = 0;
          continue;
        }

        const s = cell[v];

        switch (agg) {
          case "sum":
            obj[key] = s.sum;
            break;

          case "avg":
            obj[key] = s.count ? s.sum / s.count : 0;
            break;

          case "min":
            obj[key] = s.min === Infinity ? 0 : s.min;
            break;

          case "max":
            obj[key] = s.max === -Infinity ? 0 : s.max;
            break;

          case "count":
          default:
            obj[key] = s.count;
        }
      }
    }

    return obj;
  });
}
