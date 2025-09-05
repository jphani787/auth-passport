const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const passport = require("passport");
const { users } = require('./services/databse');
require('./services/passport')
const app = express();
const {ensureAuthenticated} = require('./middleware/auth');

app.use(express.json());
app.use(session({
    secret: 'my-session-secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.post("/register", async(req, res)=>{
    const {name, email, password} = req.body;
    try {
        if(!name || !email || !password) {
            res.status(422).json({
                error: "name, email and password are required."
            })
        }

        if((await users.findOne({email}))) {
            res.status(409).json({
                error: "email already in use"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await users.insert({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User created successfully",
            newUser
        });

    } catch (error) {
        res.status(500).json({
            error: error,
            message: "somting went wrong",
        })
    }
});

app.post("/login", async(req, res)=>{
    passport.authenticate('local', (error, user, info)=>{
        if(error){
            return res.status(500).json({
                error: "Something went wrong"
            });
        }

        if(!user){
            return res.status(401).json(info);
        }
        req.login(user, (error)=>{
            if(error){
                res.status(500).json({
                    error: "Someting went wrong"
                })
            }

            return res.status(200).json({
                id: user._id, name: user.name, email: user.email
            })
        })
    })(req, res)
    // const {email, password} = req.body;
    // try {
    //     if(!email || !password) {
    //         res.status(400).json({
    //             error: "username and password are required."
    //         });
    //     }
    //     const user = await users.findOne({email});
    //     const isPasswordMatch = await bcrypt.compare(password, user.password);
    //     if(!isPasswordMatch){
    //          res.status(401).json({
    //             message: "Password is incurrect"
    //         });
    //     }
    // } catch (error) {
    //     res.status(500).json({
    //         error: error,
    //         message: "somting went wrong."
    //     });    
    // }
});

app.get('/me', ensureAuthenticated, (req, res)=>{
    res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
    });
});

app.post('/logout', (req, res)=>{
    req.logout((error)=>{
        if(error){
            res.status(500).json({
                error: "Somting went wrong"
            })
        }
        res.status(204).send();
    })
    
});

app.listen(3000, ()=>{
    console.log('app is running at 3000 port');
});
