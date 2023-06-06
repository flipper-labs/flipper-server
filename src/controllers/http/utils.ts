export const getIntegerQueryParam = (param: string | undefined): number => {
  if (!param) throw new Error("Param is undefined or null.");

  const parsedParam = parseInt(param as string);
  if (parsedParam < 0) {
    throw new Error("Param is less than 0.");
  }

  return parsedParam;
};
