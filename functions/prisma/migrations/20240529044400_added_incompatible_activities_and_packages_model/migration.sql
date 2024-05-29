/*
  Warnings:

  - A unique constraint covering the columns `[activityId,eventId]` on the table `ActivitiesForEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[characterId,eventId]` on the table `CharactersAtEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "IncompatibleActivitiesAndPackages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activityId" INTEGER NOT NULL,
    "packageId" INTEGER NOT NULL,
    CONSTRAINT "IncompatibleActivitiesAndPackages_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IncompatibleActivitiesAndPackages_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Package" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "activityCount" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Package" ("id", "name") SELECT "id", "name" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
PRAGMA foreign_key_check("Package");
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "IncompatibleActivitiesAndPackages_activityId_packageId_key" ON "IncompatibleActivitiesAndPackages"("activityId", "packageId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivitiesForEvent_activityId_eventId_key" ON "ActivitiesForEvent"("activityId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "CharactersAtEvent_characterId_eventId_key" ON "CharactersAtEvent"("characterId", "eventId");
