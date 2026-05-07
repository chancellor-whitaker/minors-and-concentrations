import { useDeferredValue, useCallback, useState, useMemo } from "react";

const toArray = (x) => [x].filter(Boolean).flat();

export default function useFilterLists({ initialState, dropdownDefs, data }) {
  const uniqueValues = useMemo(() => getUniqueValues(data), [data]);

  const [state, setState] = useState();

  if (!state) setState(initialState);

  const deferredState = useDeferredValue(state);

  const activeValueLookup = useMemo(
    () => createActiveValueLookup(toArray(deferredState)),
    [deferredState],
  );

  const isDataValueActive = useCallback(
    (params) => createActiveValueChecker(params, activeValueLookup),
    [activeValueLookup],
  );

  const filteredData = useMemo(
    () => filterData(data, isDataValueActive),
    [isDataValueActive, data],
  );

  const dropdownFilters = useMemo(() => {
    const updateState = (params) => setState((s) => updateFilters(params, s));

    return dropdownDefs
      .map((col) => ({
        ...col,
        values: uniqueValues[col.field],
      }))
      .map(({ values = [], displayName, field }) => {
        const areAllActive = isDataValueActive({ field });

        const handleClickAll = () =>
          updateState({ active: !areAllActive, field });

        return (
          <Dropdown
            items={[
              <DropdownItem onClick={handleClickAll} active={areAllActive}>
                All
              </DropdownItem>,
              ...values.map((value) => {
                const active = isDataValueActive({ field, value });

                return (
                  <DropdownItem
                    onClick={() =>
                      updateState({ active: !active, field, value })
                    }
                    active={active}
                    key={value}
                  >
                    {!value && typeof value !== "number" ? "-- N/A --" : value}
                  </DropdownItem>
                );
              }),
            ]}
            variant={areAllActive ? "light" : "warning"}
            key={field}
          >
            {displayName}
          </Dropdown>
        );
      });
  }, [uniqueValues, isDataValueActive, dropdownDefs]);
}

const isAnAllBtn = (element) => !("value" in element);

const createActiveValueLookup = (state) => {
  const lookup = {};

  state.forEach((element) => {
    const { value, field } = element;

    if (!(field in lookup)) {
      lookup[field] = { except: new Set(), all: true };
    }

    if (isAnAllBtn(element)) {
      lookup[field].all = false;
    } else {
      lookup[field].except.add(value);
    }
  });

  return lookup;
};

const createActiveValueChecker = (params, lookup) => {
  const { value, field } = params;

  if (!(field in lookup)) return true;

  const { except, all } = lookup[field];

  if (isAnAllBtn(params)) {
    if (all && except.size === 0) return true;

    return false;
  } else {
    if (all && except.has(value)) return false;

    if (all && !except.has(value)) return true;

    if (!all && except.has(value)) return true;

    if (!all && !except.has(value)) return false;
  }
};

const filterData = (data, isValueActive) =>
  data.filter((element) => {
    for (const [field, value] of Object.entries(element)) {
      if (!isValueActive({ field, value })) {
        return false;
      }
    }

    return true;
  });

const getUniqueValues = (data = []) => {
  const valuesByField = {};

  toArray(data).forEach((row) =>
    Object.entries(row).forEach(([field, value]) => {
      if (!(field in valuesByField)) valuesByField[field] = new Set();

      valuesByField[field].add(value);
    }),
  );

  return Object.fromEntries(
    Object.entries(valuesByField).map(([field, set]) => [
      field,
      [...set].sort(),
    ]),
  );
};

const updateFilters = (params, state) => {
  const { active, field, value } = params;

  if (isAnAllBtn(params)) {
    const filteredState = state.filter((element) => element.field !== field);

    return !active ? [...filteredState, params] : filteredState;
  }

  const allUnselected = state.find(
    (element) =>
      element.field === field && !element.active && isAnAllBtn(element),
  );

  const filteredState = state.filter(
    (element) => !(element.field === field && element.value === value),
  );

  if (allUnselected && active) return [...filteredState, params];

  if (allUnselected && !active) return filteredState;

  if (!allUnselected && active) return filteredState;

  if (!allUnselected && !active) return [...filteredState, params];
};
