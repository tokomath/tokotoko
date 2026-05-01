-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sectionId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "insertType" TEXT NOT NULL,
    "insertContent" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "allocationPoint" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Question_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("answer", "id", "insertContent", "insertType", "number", "question", "sectionId") SELECT "answer", "id", "insertContent", "insertType", "number", "question", "sectionId" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
