import passport from "passport";
import User from "../models/User.model.js";
import dotenv from "dotenv";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;

dotenv.config();

/* -------------------------------------------------------------------------- */
/*                              GOOGLE STRATEGY                               */
/* -------------------------------------------------------------------------- */
/*
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // ... Google Strategy
} else {
    console.warn("⚠️ Google Social Login skipped: 'GOOGLE_CLIENT_ID' missing in .env");
}

if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    // ... LinkedIn Strategy
} else {
    console.warn("⚠️ LinkedIn Social Login skipped: 'LINKEDIN_CLIENT_ID' missing in .env");
}
*/

export default passport;
