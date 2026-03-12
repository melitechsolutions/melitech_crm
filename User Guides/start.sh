#!/bin/bash

# 1. Wait for the database to be ready (optional but recommended)
# You can add a loop here to check the database connection if needed.

# 2. Run the database schema push/migration
# This ensures the 'users' table has the new passwordHash and salt columns.
echo "Running Drizzle DB Push..."
pnpm db:push

# 3. Start the application
echo "Starting the application server..."
pnpm start
