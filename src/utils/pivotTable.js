export default function pivotTable(
  data,
  { agg = "count", column, value, rows },
) {
  const pivot = {};
  const columnsSet = new Set();

  const rowKeyFn = (item) => rows.map((r) => item[r]).join("||");

  for (const item of data) {
    const rKey = rowKeyFn(item);
    const cKey = item[column];
    const val = Number(item[value]);

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
      pivot[rKey][cKey] = {
        max: -Infinity,
        min: Infinity,
        count: 0,
        sum: 0,
      };
    }

    const cell = pivot[rKey][cKey];

    // update stats
    if (!isNaN(val)) {
      cell.sum += val;
      cell.count += 1;
      cell.min = Math.min(cell.min, val);
      cell.max = Math.max(cell.max, val);
    } else {
      // still count rows if no value provided (for pure count use-case)
      cell.count += 1;
    }
  }

  const columns = Array.from(columnsSet);

  return Object.values(pivot).map((entry) => {
    const obj = { ...entry._keys };

    for (const c of columns) {
      const cell = entry[c];

      if (!cell) {
        obj[c] = 0;
        continue;
      }

      switch (agg) {
        case "sum":
          obj[c] = cell.sum;
          break;
        case "avg":
          obj[c] = cell.count ? cell.sum / cell.count : 0;
          break;
        case "min":
          obj[c] = cell.min === Infinity ? 0 : cell.min;
          break;
        case "max":
          obj[c] = cell.max === -Infinity ? 0 : cell.max;
          break;
        case "count":
        default:
          obj[c] = cell.count;
      }
    }

    return obj;
  });
}
