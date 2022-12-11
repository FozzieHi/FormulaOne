export default async <T>(promise: Promise<T>): Promise<T | null> => {
  try {
    return await promise;
  } catch (err) {
    return null;
  }
};
