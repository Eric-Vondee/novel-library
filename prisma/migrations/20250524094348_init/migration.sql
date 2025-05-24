-- CreateTable
CREATE TABLE "Novel" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT 'No description available.',
    "status" TEXT NOT NULL,
    "chapters" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Novel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Synopsis" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "novel_id" INTEGER NOT NULL,

    CONSTRAINT "Synopsis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Novel_title_idx" ON "Novel"("title");

-- CreateIndex
CREATE INDEX "Novel_author_idx" ON "Novel"("author");

-- CreateIndex
CREATE INDEX "Synopsis_novel_id_idx" ON "Synopsis"("novel_id");

-- AddForeignKey
ALTER TABLE "Synopsis" ADD CONSTRAINT "Synopsis_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "Novel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
