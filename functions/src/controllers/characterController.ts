import { Router } from "express";
import { validateRequestBody } from "zod-express-middleware";
import { characterArraySchema } from "../types";
import { PrismaClient } from "@prisma/client";

export const characterController = Router();
const prisma = new PrismaClient();

characterController.get("/", async (_req, res) => {
  const allCharacters = await prisma.character.findMany();
  return res.status(200).json(allCharacters);
});

characterController.post(
  "/",
  validateRequestBody(characterArraySchema),
  async (req, res) => {
    try {
      const createdCharacters = await prisma.character.createMany({
        data: req.body,
      });
      return res.status(200).json({
        message: "Created characters.",
        characters: createdCharacters,
      });
    } catch (error) {
      return res.status(400).json({
        message: "Error creating characters.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
);

characterController.delete(
  "/",
  validateRequestBody(characterArraySchema),
  async (req, res) => {
    const names = req.body.map((character) => character.name);
    try {
      const deletedCharacters = await prisma.character.deleteMany({
        where: {
          name: {
            in: names,
          },
        },
      });

      return res.status(200).json({
        message: "Deleted characters.",
        count: deletedCharacters.count,
      });
    } catch (error) {
      return res.status(400).json({
        message: "Error deleting characters.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
);
