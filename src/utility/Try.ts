export default async <T>(promise: Promise<T>): Promise<boolean> => {
  try {
    await promise;
    return true;
  } catch (err) {
    return false;
  }
};
