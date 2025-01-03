import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
  log: ["error"],
  errorFormat: "pretty",
});

prisma
  .$connect()
  .then(() => {
    console.log("Prisma has started working");
  })
  .catch((error) => console.log(`${error.message}`));

export default prisma;
