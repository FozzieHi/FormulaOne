export = async (promise: Promise<unknown>) => {
  try {
    await promise;
    return true;
  } catch (err) {
    return false;
  }
};
