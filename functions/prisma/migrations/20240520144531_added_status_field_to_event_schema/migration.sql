-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "parentFirstName" TEXT NOT NULL,
    "parentLastName" TEXT NOT NULL,
    "phoneNumber" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "time" DATETIME NOT NULL,
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
    "status" TEXT NOT NULL DEFAULT 'requested',
    CONSTRAINT "Event_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("addressId", "birthdayChildAge", "birthdayChildName", "couponCode", "date", "email", "firstInteraction", "howDidYouFindUs", "id", "indoors", "maxParticipantAge", "minParticipantAge", "notes", "packageId", "parentFirstName", "parentLastName", "participants", "phoneNumber", "referralCode", "time") SELECT "addressId", "birthdayChildAge", "birthdayChildName", "couponCode", "date", "email", "firstInteraction", "howDidYouFindUs", "id", "indoors", "maxParticipantAge", "minParticipantAge", "notes", "packageId", "parentFirstName", "parentLastName", "participants", "phoneNumber", "referralCode", "time" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_addressId_key" ON "Event"("addressId");
PRAGMA foreign_key_check("Event");
PRAGMA foreign_keys=ON;
