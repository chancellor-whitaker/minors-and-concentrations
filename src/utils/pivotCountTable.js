export default function pivotCountTable(data, { column, rows }) {
  const pivot = {};
  const columnsSet = new Set();

  const rowKeyFn = (item) => rows.map((r) => item[r]).join("||");

  // Build pivot map
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

    pivot[rKey][cKey] = (pivot[rKey][cKey] || 0) + 1;
  }

  const columns = Array.from(columnsSet);

  // Convert to array of objects
  return Object.values(pivot).map((entry) => {
    const obj = { ...entry._keys };

    for (const c of columns) {
      obj[c] = entry[c] || 0;
    }

    delete obj._keys;
    return obj;
  });
}
