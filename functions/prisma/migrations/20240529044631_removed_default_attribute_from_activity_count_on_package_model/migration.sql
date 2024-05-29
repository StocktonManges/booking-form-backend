-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Package" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "activityCount" INTEGER NOT NULL
);
INSERT INTO "new_Package" ("activityCount", "id", "name") SELECT "activityCount", "id", "name" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
PRAGMA foreign_key_check("Package");
PRAGMA foreign_keys=ON;
