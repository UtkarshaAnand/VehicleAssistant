const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const path = require('path');

const User = require('../models/User');
const keys = require('../config'); 
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/', 'Index.html'));
});

// router.get('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, '../public/', 'Login.html'));
// });

router.get('/login', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
          return next(err); 
        }
        if(!user) { 
            return res.render('login'); 
        }
        else{ 
            const name =  user.name;

            return res.status(200).redirect('/home');
        }
    }) (req, res, next);
});

// router.get('/signup', (req, res) => {
//     res.sendFile(path.join(__dirname, '../public/', 'Signup.html')); 
// });

router.get('/signUp', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
          return next(err); 
        }
        if(!user) { 
            return res.render('signUp');
        }
        else{ 
            const name =  user.name;

            return res.status(200).redirect('/home');
        }
    }) (req, res, next);
  });


router.post('/signUp', (req, res) => {
    
    const {errors, isValid} = validateRegisterInput(req.body);
    
    // check validation for registration input
    if(!isValid){
        return res.status(400).render('signUp', {
            errors
        });
    }

    User.findOne({email: req.body.email})
        .then(user => {
            if(user){
                errors.email = 'Email already in use';
                return res.status(400).render('signUp', {
                    errors
                });    
            }
            else{
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });
                //console.log(newUser);

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        var success = true;
                        newUser.save()
                            //.then(user => res.json("Registration Succesfull! Please, login to continue"))
                            .then(user => res.render('signUp'), {
                                success
                            })
                            .catch(err);
                    });
                });
            }
        });
    });

router.post('/login', (req, res) => {
    
    const {errors, isValid} = validateLoginInput(req.body);
    
    // check validation for registration input
    if(!isValid){
        return res.status(400).render('login', {
            errors
        });
    }

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email})
        .then(user => {
            if(!user){
                errors.email = "Invalid email"
                return res.status(404).render('login',{
                    errors
                });
            }
            const name = user.name;
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        // user matched/ token 
                        const payload = {id: user.id, name: user.name};
                        jwt.sign(payload, 
                            keys.secretOrKey, 
                            {expiresIn: 3600}, 
                            (err, token) => {
                                res.cookie('jwt', token, {
                                    expires: new Date(Date.now() + 3600*1000),
                                    secure: false,
                                    httpOnly: true
                                });
                                /*res.json({
                                    message: "Succesful Login",
                                    Userid: user.Userid,
                                    name: user.name,
                                });*/
                                res.redirect('/home');
                            });
                    }
                    else{
                        errors.password = "Password incorrect";
                        return res.status(400).render('login', {
                            errors
                        });
                    }
                });
        });
});

router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/home');
});

// router.get('/profile', passport.authenticate('jwt', {session: false}, {failureRedirect: '/login'}, {failureFlash: 'Inavalid username or password'}), (req, res) => {
//     const name =  req.user.name;
//     //const email = req.user.email;

//     res.status(200).render('profile', {
//         name
//     });
// });

router.get('/home', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
          return next(err); 
        }
        if(!user) { 
            return res.redirect('/login'); 
        }
        else{ 
            const name =  user.name;

            return res.status(200).render('home', {
                name
            });
        }
    }) (req, res, next);
  });

router.get('/home/chatRoom', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
          return next(err); 
        }
        if(!user) { 
            return res.redirect('/login'); 
        }
        else{ 
            return res.status(200).json('Welcome to chat room!');
        }
    }) (req, res, next);
  });

module.exports = router;