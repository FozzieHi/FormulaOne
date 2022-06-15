export = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    return await promise;
  } catch (err) {
    return null;
  }
};
