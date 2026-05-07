import { useCallback, useState, useMemo } from "react";

import { MeasuredCell } from "./MeasuredCell";
import { usePrevious } from "./usePrevious";

export const useColumnWidths = (rows, cellPadding = 25) => {
  const rowData = useMemo(
    () => [rows].filter((element) => element).flat(),
    [rows]
  );

  const distinctValues = useMemo(() => {
    const store = {};

    rowData.forEach((row) =>
      Object.keys(row).forEach((key) => {
        if (!(key in store)) store[key] = new Set();

        store[key].add(row[key]);
      })
    );

    return store;
  }, [rowData]);

  const initialColumnWidths = useMemo(
    () =>
      Object.fromEntries(Object.keys(distinctValues).map((key) => [key, 0])),
    [distinctValues]
  );

  // store max value width & field width so you can compute wrapping measurement
  const [columnWidths, setColumnWidths] = useState();

  console.log(columnWidths);

  usePrevious(initialColumnWidths, () => setColumnWidths(initialColumnWidths));

  const updateColumnWidths = useCallback(
    ({ field, width }) =>
      setColumnWidths((colWidths) =>
        width > colWidths[field]
          ? Object.fromEntries(
              Object.entries(colWidths).map((entry) =>
                entry[0] === field ? [field, width] : entry
              )
            )
          : colWidths
      ),
    []
  );

  const measuredCells = (
    <div style={{ pointerEvents: "none", position: "fixed", opacity: 0 }}>
      {Object.keys(distinctValues).map((field) => (
        <MeasuredCell
          updateColumnWidths={updateColumnWidths}
          key={`${field}`}
          field={field}
        >
          {`${field}`}
        </MeasuredCell>
      ))}
      {Object.entries(distinctValues).map(([field, set]) =>
        [...set].map((value) => (
          <MeasuredCell
            updateColumnWidths={updateColumnWidths}
            key={`${field}-${value}`}
            field={field}
          >
            {`${value}`}
          </MeasuredCell>
        ))
      )}
    </div>
  );

  const getWidth = useCallback(
    (field) =>
      columnWidths && columnWidths[field]
        ? Math.ceil(columnWidths[field]) + cellPadding
        : null,
    [cellPadding, columnWidths]
  );

  const setWidths = useCallback(
    (defs) =>
      defs.map(({ field, ...rest }) => ({
        ...rest,
        width: getWidth(field),
        field,
      })),
    [getWidth]
  );

  return { measuredCells, setWidths };
};
