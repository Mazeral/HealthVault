import { mockDeep, mockReset } from "jest-mock-extended";

import prisma from "./utils/prisma";

jest.mock("./client", () => ({
	__es6: true,
  prisma: mockDeep()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

const prismaMock = prisma

export default prismaMock;
