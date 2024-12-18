// Creating a prismaMock mock for tests
import { mockDeep, mockReset } from 'jest-mock-extended';

import { prisma } from './utils/prisma';

jest.mock('./utils/prisma', () => ({
	prisma: mockDeep(),
	__es6: true,
}));

beforeEach(() => {
	mockReset(prismaMock);
});

const prismaMock = prisma;

export default prismaMock;
