const createObject = (fields: { [key: string]: any }) => {
  const obj: { [key: string]: any } = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) {
      obj[key] = value;
    }
  }

  return obj;
};

export default createObject;
