-- This migration will intentionally fail to test error handling
-- It attempts to add a NOT NULL column without a default value to a table with existing data

-- Step 1: This will succeed (create a test table)
CREATE TABLE IF NOT EXISTS "_test_migration_table" (
    id SERIAL PRIMARY KEY,
    name TEXT
);

-- Step 2: Insert some test data
INSERT INTO "_test_migration_table" (name) VALUES ('test1'), ('test2');

-- Step 3: This will FAIL - trying to add NOT NULL column without default to table with data
-- PostgreSQL will reject this because existing rows don't have a value for this column
ALTER TABLE "_test_migration_table" 
ADD COLUMN "required_field" TEXT NOT NULL;

-- Step 4: This will never execute (because Step 3 fails)
DROP TABLE "_test_migration_table";
