const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
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