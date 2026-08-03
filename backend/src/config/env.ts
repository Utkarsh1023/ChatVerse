import dotenv from "dotenv";
import path from "path";

// Load .env BEFORE any other module that reads process.env at import time
// (e.g. cloudinary.ts). Because CommonJS hoists all static imports, the
// dotenv.config() call in server.ts runs AFTER modules like cloudinary.ts
// have already read the environment — leaving credentials undefined.
//
// Importing this module FIRST (it's the first import in server.ts) guarantees
// process.env is populated before any config module is evaluated.
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

