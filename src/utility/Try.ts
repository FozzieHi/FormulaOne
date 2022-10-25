export default async (promise: Promise<unknown>) => {
  try {
    await promise;
    return true;
  } catch (err) {
    return false;
  }
};
