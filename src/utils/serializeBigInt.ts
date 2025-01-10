// src/utils/serializeBigInt.ts
export function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}
