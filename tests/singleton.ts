import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

import prisma from "../src/utils/prisma";

jest.mock("../src/utils/prisma", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
export default prismaMock;
