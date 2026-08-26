const excludedFilterKeys = [
  "residency",
  "retained",
  "cohort",
  "total",
  "race",
  "sex",
  "URM",
];

export const returnSelf = (value) => value;

export const emptyList = () => [];

export const pinRows = (pinnedRows, rows) => [
  ...pinnedRows,
  ...rows.filter((row) => !pinnedRows.includes(row)),
];

export const getFilterLists = (obj, ...additionalExcludedKeys) =>
  Object.fromEntries(
    Object.entries(obj)
      .filter(
        ([key]) =>
          ![...excludedFilterKeys, ...additionalExcludedKeys].includes(key),
      )
      .map(([key, values]) =>
        key !== "minor"
          ? [key, values]
          : [
              key,
              new Set(
                [...values].filter(
                  (value) => !["Honors Maroon", "Honors Gold"].includes(value),
                ),
              ),
            ],
      ),
  );
