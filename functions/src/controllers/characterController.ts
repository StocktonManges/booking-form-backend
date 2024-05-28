import { Router } from "express";
import {
  validateRequestBody,
  validateRequestParams,
} from "zod-express-middleware";
import {
  characterArraySchema,
  activateOrDeactivateParamSchema,
} from "../types";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

export const characterController = Router();
const prisma = new PrismaClient();

// Get all active characters
characterController.get("/", async (_req, res) => {
  const allActiveCharacters = await prisma.character.findMany({
    where: {
      isActive: true,
    },
  });
  return res.status(200).json(allActiveCharacters);
});

// Get all characters
characterController.get("/all", async (_req, res) => {
  const allCharacters = await prisma.character.findMany();
  return res.status(200).json(allCharacters);
});

characterController.post(
  "/",
  validateRequestBody(characterArraySchema),
  async (req, res) => {
    const charNoIdArr = req.body.map((charInfo) => {
      const { id, ...charNoId } = charInfo;
      return charNoId;
    });
    try {
      const createdCharacters = await prisma.character.createMany({
        data: charNoIdArr,
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

// Batch activate or deactivate characters
characterController.patch(
  "/:activateOrDeactivate",
  validateRequestBody(
    z.array(
      z.string({
        errorMap: () => ({ message: "Must be an array of character names." }),
      })
    )
  ),
  validateRequestParams(activateOrDeactivateParamSchema),
  async (req, res) => {
    const activateOrDeactivate = req.params.activateOrDeactivate === "activate";

    const updatedCharacters = await prisma.character.updateMany({
      where: {
        name: {
          in: req.body,
        },
      },
      data: { isActive: activateOrDeactivate },
    });

    return res.status(200).json({
      message: "Updated characters.",
      characters: updatedCharacters,
    });
  }
);
