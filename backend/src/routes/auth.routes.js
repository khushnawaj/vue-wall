import express from "express";
import passport from "passport";
import { signup, login } from "../controllers/auth.controller.js";
import generateToken from "../utils/generateTokens.js";

const router = express.Router();

/* --------------------
   LOCAL AUTH
-------------------- */
router.post("/signup", signup);
router.post("/login", login);

/* --------------------
   GOOGLE AUTH
-------------------- */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req, res) => {
        const token = generateToken(req.user._id);
        res.redirect(`http://localhost:3000/auth/social-callback?token=${token}`);
    }
);

export default router;
