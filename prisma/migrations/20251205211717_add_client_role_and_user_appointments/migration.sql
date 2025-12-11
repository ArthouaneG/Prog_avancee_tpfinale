-- AlterTable: Add userId column to Appointment
ALTER TABLE "Appointment" ADD COLUMN "userId" INTEGER;

-- AlterTable: Update User role default to 'client'
-- Note: SQLite doesn't support ALTER COLUMN DEFAULT, so we'll handle this at application level