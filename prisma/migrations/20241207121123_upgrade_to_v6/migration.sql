-- AlterTable
ALTER TABLE "_PostCategories" ADD CONSTRAINT "_PostCategories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PostCategories_AB_unique";

-- AlterTable
ALTER TABLE "_VideoCategories" ADD CONSTRAINT "_VideoCategories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_VideoCategories_AB_unique";
