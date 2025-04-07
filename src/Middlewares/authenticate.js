const jwt = require('jsonwebtoken');
const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require('../Models/Employee');

// Secret Key
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Function to generate JWT Token and set cookie
const generateToken = (user, res) => {
    const token = jwt.sign(
        { id: user._id, role: user.role },
        SECRET_KEY,
        { expiresIn: "1d" } // Token expires in 1 hour
    );

    // Set the cookie
    res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure in production
        sameSite: "strict",
        maxAge: 86400000 // 1 hour expiration in milliseconds
    });

    return token;
};

// Passport JWT Strategy Options
const options = {
    jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.authToken // Extract JWT from cookies
    ]),
    secretOrKey: SECRET_KEY
};

// Configure Passport JWT Strategy
passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.id);
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

// Authorization Middleware
const authorize = (roles = []) => (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, user) => {
        if (err) {
            console.error("JWT Authentication Error:", err);
            return res.status(500).render('500');
        }

        if (!user) {
            return res.status(401).render('401'); // Unauthorized
        }

        // If roles array is empty, allow all authenticated users
        if (!roles.length || roles.includes(user.role)) {
            req.user = user; // Attach user to request
            return next();
        }

        return res.status(403).render('403'); // Forbidden
    })(req, res, next);
}

module.exports = { generateToken, authorize };
