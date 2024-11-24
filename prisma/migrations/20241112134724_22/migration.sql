-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PremiumQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "name" TEXT,
    "text" TEXT NOT NULL,
    "info" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PremiumQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PremiumQuestion" ("createdAt", "id", "info", "name", "section", "text", "userId") SELECT "createdAt", "id", "info", "name", "section", "text", "userId" FROM "PremiumQuestion";
DROP TABLE "PremiumQuestion";
ALTER TABLE "new_PremiumQuestion" RENAME TO "PremiumQuestion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
