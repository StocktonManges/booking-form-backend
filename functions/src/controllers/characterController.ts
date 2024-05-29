import { Router } from "express";
import {
  validateRequestBody,
  validateRequestParams,
} from "zod-express-middleware";
import {
  characterArraySchema,
  activateOrDeactivateParamSchema,
  characterOptionalSchema,
} from "../types";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

export const characterController = Router();
const prisma = new PrismaClient();

const getAllCharacterNames = async () => {
  return await prisma.character
    .findMany({
      select: {
        name: true,
      },
    })
    .then((chars) => chars.map((char) => char.name));
};

const verifyNameIsUnique = async (newName: string) => {
  const allCharacterNames = await getAllCharacterNames();

  return allCharacterNames.every((charName) => charName !== newName);
};

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
    // Check if names are unique.
    const namesAreUniqueArr = await Promise.all(
      req.body.map(async (char) => {
        const nameIsUnique = await verifyNameIsUnique(char.name);
        if (!nameIsUnique) {
          return char.name;
        }
        return true;
      })
    );

    const namesAreUnique = namesAreUniqueArr.every((item) => item === true);
    if (!namesAreUnique) {
      const invalidCharacters = namesAreUniqueArr.filter(
        (item) => item !== true
      );
      return res.status(400).json({
        message:
          "No characters created. One or more entered names are already in use.",
        invalidCharacters,
      });
    }

    // Create characters.
    const charNoIdArr = req.body.map((charInfo) => {
      const { id, ...charNoId } = charInfo;
      return charNoId;
    });
    try {
      const createdCharacters = await prisma.character.createMany({
        data: charNoIdArr,
      });
      const characterNames = req.body.map((char) => char.name);
      return res.status(200).json({
        message: "Created characters.",
        count: createdCharacters.count,
        characters: characterNames,
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

    // Verify that none of the characters have a history of being booked.
    const charsAtEventIds = await prisma.charactersAtEvent
      .findMany()
      .then((charsAtEvent) => charsAtEvent.map((item) => item.characterId));

    const charsNeverBookedArr = req.body.map((char) => {
      if (charsAtEventIds.includes(char.id)) {
        return char;
      }
      return true;
    });
    const charsNeverBooked = charsNeverBookedArr.every((item) => item === true);
    if (!charsNeverBooked) {
      const charactersWithHistory = characterArraySchema.parse(
        charsNeverBookedArr.filter((item) => item !== true)
      );
      return res.status(400).json({
        message:
          "Unable to delete characters. One or more characters have an event history.",
        charactersWithHistory,
      });
    }

    // Delete the characters.
    try {
      const deletedCharacters = await prisma.character.deleteMany({
        where: {
          name: {
            in: names,
          },
        },
      });

      const characterNames = req.body.map((char) => char.name);

      return res.status(200).json({
        message: "Deleted characters.",
        count: deletedCharacters.count,
        characters: characterNames,
      });
    } catch (error) {
      return res.status(400).json({
        message: "Error deleting characters.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
);

// Update a single character.
characterController.patch(
  "/",
  validateRequestBody(characterOptionalSchema),
  async (req, res) => {
    const charId = +req.body.id;
    const { id, ...dataNoId } = req.body;

    // Verify the new name is unique.
    if (req.body.name) {
      const nameIsUnique = await verifyNameIsUnique(req.body.name);
      if (!nameIsUnique) {
        return res.status(400).json({
          message: `Character names must be unique. '${req.body.name}' is already used.`,
        });
      }
    }

    // Update character.
    const updatedCharacter = await prisma.character.update({
      where: {
        id: charId,
      },
      data: dataNoId,
    });

    return res
      .status(200)
      .json({ message: "Updated character.", updatedCharacter });
  }
);

// Batch activate or deactivate characters.
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
    const nameList = req.body;

    // Validate the spelling of all names.
    const allCharacterNames = await getAllCharacterNames();

    const allEntriesValidArr = nameList.map((charName) => {
      if (!allCharacterNames.includes(charName)) {
        return charName;
      }
      return true;
    });

    if (!allEntriesValidArr.every((elm) => elm === true)) {
      const invalidEntries = allEntriesValidArr.filter(
        (elm) => typeof elm === "string"
      );
      return res.status(400).json({
        message: "No updates performed. One or more entries were invalid.",
        invalidEntries,
      });
    }

    // If all names are valid, update all characters.
    const updatedCharacters = await prisma.character.updateMany({
      where: {
        name: {
          in: nameList,
        },
      },
      data: { isActive: activateOrDeactivate },
    });

    if (updatedCharacters.count === 0) {
      return res
        .status(400)
        .json({ message: "No updates performed. Invalid character names." });
    }

    return res.status(200).json({
      message: `Successfully ${req.params.activateOrDeactivate}d characters.`,
      count: updatedCharacters.count,
      characters: nameList,
    });
  }
);
