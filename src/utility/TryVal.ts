export default async <Type>(promise: Promise<Type>): Promise<Type | null> => {
  try {
    return await promise;
  } catch (err) {
    return null;
  }
};
