const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const {users} = require("./databse");

passport.use(new LocalStrategy({usernameField: 'email'}, async(email, password, done)=>{
    try {
        const user = await users.findOne({email});
        if(!user){
            return done(null, false, {error: "Incorrect email or password"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return done(null, false, {error: "Incorrect email or password"});
        }
        done(null, user)
    } catch (error) {
        done(error);
    }
}))

passport.use(new GoogleStrategy({
    clientID: '446679021255-n5g64tjkigshd03av7nigth36ojc0683.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: '/auth/google/callback'
}, async(accessToken, refreshToken, profile, done)=>{
    try {
        const User = await users.findOne({
            googleId: profile.id
        });
        if(User) {
            return done(null, User)
        }

        const newUser = await users.insert({
            googleId: profile.id,
            name: profile.name,
            email: profile.emails[0].value
        });

        done(null, newUser);
    } catch (error) {
        done(error);
    }
}));


passport.serializeUser((user, done)=>{
    done(null, user._id);
})

passport.deserializeUser(async(userId, done)=>{
    try {
        const user = await users.findOne({_id: userId})
        if(!user){
            return done(new Error('User not found!'));
        }  
        done(null, user);
    } catch (error) {
        done(error);
    }
})