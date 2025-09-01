-- CreateTable
CREATE TABLE "public"."UserLogin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLogin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLogin_userId_loginDate_key" ON "public"."UserLogin"("userId", "loginDate");

-- AddForeignKey
ALTER TABLE "public"."UserLogin" ADD CONSTRAINT "UserLogin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
