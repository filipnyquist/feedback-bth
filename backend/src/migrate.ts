import { runMigrations } from "./db";

console.log("Running database migrations...");
runMigrations();
console.log("Done.");
