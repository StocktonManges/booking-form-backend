/*
  Warnings:

  - You are about to drop the column `parentFirstName` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `parentLastName` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `lineOne` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `lineTwo` on the `Address` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "parentName" TEXT NOT NULL DEFAULT '',
    "phoneNumber" TEXT NOT NULL,
    "dateTime" DATETIME NOT NULL,
    "addressId" INTEGER NOT NULL,
    "indoors" BOOLEAN NOT NULL,
    "packageId" INTEGER NOT NULL,
    "participants" INTEGER NOT NULL,
    "minParticipantAge" INTEGER NOT NULL,
    "maxParticipantAge" INTEGER NOT NULL,
    "birthdayChildName" TEXT NOT NULL,
    "birthdayChildAge" INTEGER NOT NULL,
    "firstInteraction" BOOLEAN NOT NULL,
    "notes" TEXT,
    "couponCode" TEXT,
    "referralCode" TEXT,
    "howDidYouFindUs" TEXT,
    "statusId" INTEGER NOT NULL,
    CONSTRAINT "Event_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("addressId", "birthdayChildAge", "birthdayChildName", "couponCode", "dateTime", "email", "firstInteraction", "howDidYouFindUs", "id", "indoors", "maxParticipantAge", "minParticipantAge", "notes", "packageId", "participants", "phoneNumber", "referralCode", "statusId") SELECT "addressId", "birthdayChildAge", "birthdayChildName", "couponCode", "dateTime", "email", "firstInteraction", "howDidYouFindUs", "id", "indoors", "maxParticipantAge", "minParticipantAge", "notes", "packageId", "participants", "phoneNumber", "referralCode", "statusId" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_addressId_key" ON "Event"("addressId");
CREATE TABLE "new_Address" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "street" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL
);
INSERT INTO "new_Address" ("city", "id", "state") SELECT "city", "id", "state" FROM "Address";
DROP TABLE "Address";
ALTER TABLE "new_Address" RENAME TO "Address";
PRAGMA foreign_key_check("Event");
PRAGMA foreign_key_check("Address");
PRAGMA foreign_keys=ON;
