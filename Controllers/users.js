const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const User = require('../Models/User');
const Car = require('../Models/Car');
const keys = require('../config'); 
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

//custom image storage function
var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+ '.jpg')
    }
})

const { spawn } = require('child_process');

var upload = multer({ storage: storage });

router.get('/', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
          return next(err); 
        }
        if(!user) { 
            return res.render('index'); 
        }
        else{ 
            return res.status(200).redirect('/home');
        }
    }) (req, res, next);
});

router.get('/login', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
          return next(err); 
        }
        if(!user) { 
            return res.render('login'); 
        }
        else{ 
            return res.status(200).redirect('/home');
        }
    }) (req, res, next);
});

router.get('/signUp', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
          return next(err); 
        }
        if(!user) { 
            return res.render('signUp');
        }
        else{ 
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
                    password: req.body.password,
                    contactNumber: req.body.contact
                });
                //console.log(newUser);

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            //.then(user => res.json("Registration Succesfull! Please, login to continue"))
                            .then(res.render('login'))
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
                                    httpOnly: true,
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

router.get('/home', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
          return next(err); 
        }
        if(!user) { 
            return res.redirect('/login'); 
        }
        else{ 
            Car.find({})
            .then(cars => { 
                return res.render('home', {
                    user,
                    cars
                });
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

// router.get('/home/sellCar/ownerDetails', function(req, res, next) {
//     passport.authenticate('jwt', function(err, user) {
//         if(err) { 
//             return next(err); 
//         }
//         if(!user) { 
//             return res.redirect('/login'); 
//         }
//         else{ 
//             return res.status(200).render('ownerDetails');
//         }
//     }) (req, res, next);
// });

// router.post('/home/sellCar/ownerDetails', (req, res) => {
//     const newOwner = new Owner({
//         ownerName: req.body.ownerName,
//         ownerDOB: req.body.ownerDOB,
//         ownerContact: req.body.ownerContact,
//         ownerAddress: req.body.ownerAddress
//     });
//     const owner = Owner.findOne().sort({created_at: -1}).populate('cars');
//     newOwner.save()
//     .then(res.redirect('/home/sellcar/carDetails'))
//     .catch();
// });

router.get('/home/sellCar/carDetails', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
            return next(err); 
        }
        if(!user) { 
            return res.redirect('/login'); 
        }
        else{ 
            return res.status(200).render('carDetails');
        }
    }) (req, res, next);
});

router.post('/home/sellCar/carDetails', upload.single('photo'), function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        if(!user) {
            return res.redirect('/login');
        }
        else {
            const newCar = new Car({ 
                brand: req.body.brand,
                model: req.body.model,
                regState: req.body.regState,
                regCity: req.body.regCity,
                regYear: req.body.regYear,
                owner: user._id,
                image: req.file.path
            });

            newCar.save()
            .then(res.redirect('/home'))
            .catch();
        }
    }) (req, res, next);
});

router.get('/home/car/:carid', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        if(!user) {
            return res.redirect('/login');
        }
        else {
            Car.findOne({_id: req.params.carid})
            .then(car => {
                if(!car) {
                    return console.log("Car not found!");
                }
                else {
                    const owner_id = car.owner;
                    User.findById({_id: owner_id})
                    .then(owner => {
                        if(!owner) {
                            return console.log('Owner not found!');
                        }
                        else {
                            return res.status(200).render('buyCar', {
                                car,
                                owner
                            });
                        }
                    })
                }
            })
            //return res.status(200).render('buyCar');    
        }

    }) (req, res, next);
});

router.get('/home/drive', (req, res) => {
    const scriptPath = 'D:/Rishu/VehicleAssistant/Scripts/Drowsiness.py'
    const process = spawn('python', [scriptPath])
    
    process.stderr.on('data', (myErr) => {
        console.log(myErr);
    })

    process.on('exit', function (code, signal) {
        console.log('child process exited with ' +
                    `code ${code} and signal ${signal}`);
        return res.redirect('/');
    });
});

module.exports = router;