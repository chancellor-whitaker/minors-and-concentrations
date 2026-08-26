import programCollegeLookup from "../programCollegeLookup";
import minorCollegeLookup from "../minorCollegeLookup";
import { dataOrder } from "./data";

const normalizeData = (result) =>
  Object.fromEntries(dataOrder.map((name, index) => [name, result[index]]));

export const concentrationDataAccessor = (result) => {
  if (!result) return [];

  const data = normalizeData(result);

  return data.concentrations.map(
    ({ base_id: baseId, conc_id: concentrationId, ...rest }) => ({
      ...data.base[baseId],
      ...rest,
      program_college: programCollegeLookup[data.base[baseId].program] || "",
      concentration: data.descriptions[concentrationId],
    }),
  );
};

export const minorDataAccessor = (result) => {
  if (!result) return [];

  const data = normalizeData(result);

  return data.minors.map(
    ({ minor_id: minorId, base_id: baseId, ...rest }) => ({
      ...data.base[baseId],
      ...rest,
      minor_college: minorCollegeLookup[data.descriptions[minorId]] || "",
      minor: data.descriptions[minorId],
    }),
  );
};
