import { defaultValueFormatter, formatPercentage } from "./formatters";

export const ARROW = "→";

const autoSizeGrid = (event) => {
  event.api.autoSizeAllColumns();
};

export const autoSizeProps = {
  autoSizeStrategy: { type: "fitCellContents" },
  onGridSizeChanged: autoSizeGrid,
  onRowDataUpdated: autoSizeGrid,
};

export const defaultColDef = {
  suppressMovable: true,
  lockVisible: true,
};

const rowSortProps = (rows, def) =>
  rows.includes(def.field)
    ? {
        sortIndex: rows.indexOf(def.field),
        suppressSizeToFit: true,
        sort: "asc",
      }
    : {};

// Pivot fields are emitted as:
//   columnValue→valueField→aggType
// and derived fields as:
//   columnValue→derivedField
//
// AG Grid renders columnValue as the group header and only the remaining path
// as the child header. This restores the original grouped-header behavior while
// keeping valueField → aggType literal when multiple measures are present.
export const parseArrowColumns = (columnDefs) => {
  const groups = [];
  const groupsByHeader = new Map();

  columnDefs
    .filter(({ field }) => field.includes(ARROW))
    .forEach((def) => {
      const [columnValue, ...childPath] = def.field.split(ARROW);

      if (!groupsByHeader.has(columnValue)) {
        const group = {
          headerName: columnValue,
          children: [],
        };

        groupsByHeader.set(columnValue, group);
        groups.push(group);
      }

      groupsByHeader.get(columnValue).children.push({
        ...def,
        valueFormatter: def.field.includes("%")
          ? formatPercentage
          : defaultValueFormatter,
        headerName: childPath.map((s, i) => (i === 0 ? s : `(${s})`)).join(" "),
        headerClass: ["child-header", "ag-right-aligned-header"],
        type: "numericColumn",
      });
    });

  return groups;
};

export const getRetentionGridProps = (
  { columnDefs, ...params },
  { pivotConfig: { rows } },
) => {
  const rowColumnDefs = columnDefs
    .filter(({ field }) => !field.includes(ARROW))
    .map((def) => ({
      ...def,
      ...rowSortProps(rows, def),
    }));

  return {
    columnDefs: [...rowColumnDefs, ...parseArrowColumns(columnDefs)],
    defaultColDef,
    ...params,
    ...autoSizeProps,
  };
};

export const createDetailGridProps =
  ({ numericColumnLimit = 3, headerNames = {}, fieldDefs }) =>
  ({ columnDefs, ...params }, { pivotConfig }) => {
    const pivotRows = pivotConfig.rows;

    const formattedColumnDefs = columnDefs.map((def) => ({
      ...def,
      valueFormatter: defaultValueFormatter,
      ...fieldDefs[def.field],
      ...(def.field.includes(ARROW)
        ? { headerName: def.field.split(ARROW)[0] }
        : headerNames[def.field]
          ? { headerName: headerNames[def.field] }
          : {}),
      type: pivotRows.includes(def.field) ? null : "numericColumn",
    }));

    return {
      ...params,
      ...autoSizeProps,
      columnDefs: [
        ...formattedColumnDefs.filter(({ type }) => type === null),
        ...(numericColumnLimit == null
          ? formattedColumnDefs.filter(({ type }) => type === "numericColumn")
          : formattedColumnDefs
              .filter(({ type }) => type === "numericColumn")
              .slice(-numericColumnLimit)),
      ],
      defaultColDef,
    };
  };
