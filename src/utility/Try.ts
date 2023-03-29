export default async <Type>(
  promise: Promise<Type>,
  filterMsg?: string
): Promise<boolean> => {
  try {
    await promise;
    return true;
  } catch (err) {
    if (
      filterMsg != null &&
      err instanceof Error &&
      !err.message?.includes(filterMsg)
    ) {
      throw err;
    }
    return false;
  }
};
