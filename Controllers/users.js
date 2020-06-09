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
const validatePasswordInput = require('../validation/change-password');

//custom image storage function
var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+ '.jpg')
    }
})

function runPython(carDetails, cb) {
    var scriptPath = 'D:/Rishu/VehicleAssistant/Scripts/FinalPrediction.py'
    var process = spawn('python', [scriptPath, carDetails])

    var predictedPrice = '';

    process.stdout.on('data', (data) => {
        predictedPrice += data.toString('utf-8');
    })

    process.on('close', function (code) {
        cb(predictedPrice);
    });
}


const { spawn } = require('child_process');

var upload = multer({ storage: storage });

router.get('/', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
          return next(err); 
        }
        if(!user) { 
            return res.sendFile((path.join(__dirname, '../views/index.html'))); 
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


router.post('/signUp', upload.single('photo'), (req, res) => {
    
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
                var filePath = './uploads/defaultProfile.png'
                if(req.file) {
                    filePath = req.file.path
                }
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    contactNumber: req.body.contact,
                    profilePicture: filePath
                });
            
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            //.then(user => res.json("Registration Succesfull! Please, login to continue"))
                            .then(res.redirect('/login'))
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
                if(!cars) {
                    return console.log("No car available")
                }
                else {
                    return res.render('home', {
                        user,
                    });
                }
            });
        }
    }) (req, res, next);
  });

router.get('/chatRoom/:username/:carid', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
          return next(err); 
        }
        if(!user) { 
            return res.redirect('/login'); 
        }
        else{ 
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
                            return res.status(200).render('joinChat', {
                                car,
                                user
                            });
                        }
                    })
                }
            })
            //return res.sendFile(path.join(__dirname, '../views/joinChat.html'));
        }
    }) (req, res, next);
});

router.get('/usedCars', function(req, res, next) {
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
                if(!cars) {
                    return console.log("No car available")
                }
                else {
                    return res.render('usedCars', {
                        user,
                        cars
                    });
                }
            });
        }
    }) (req, res, next);
});

router.get('/sellCar/carDetails', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
            return next(err); 
        }
        if(!user) { 
            return res.redirect('/login'); 
        }
        else{ 
            return res.status(200).render('carDetails', {
                user
            });
        }
    }) (req, res, next);
});

router.get('/evaluateCar', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
            return next(err); 
        }
        if(!user) { 
            return res.redirect('/login'); 
        }
        else{ 
            return res.status(200).render('evaluateCar', {
                user
            });
        }
    }) (req, res, next);
});

router.post('/evaluateCar', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) { 
            return next(err); 
        }
        if(!user) { 
            return res.redirect('/login'); 
        }
        else{ 
            var carDetails = [req.body.brand, req.body.model, req.body.regState, req.body.regCity, req.body.regYear, req.body.km];
            
            runPython(carDetails, function(result) {               
                var value = result;
                res.render('prediction', {
                    value,
                    carDetails,
                    user
                })
            })
        }
    }) (req, res, next);
});

router.post('/sellCar/carDetails', upload.single('photo'), function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        if(!user) {
            return res.redirect('/login');
        }
        else {
            var room = req.body.brand + user.name.substr(0, user.name.indexOf(' '));
            var now = new Date();
            now.setDate(now.getDate() + 7);
            
            const newCar = new Car({ 
                brand: req.body.brand,
                model: req.body.model,
                regState: req.body.regState,
                regCity: req.body.regCity,
                regYear: req.body.regYear,
                km: req.body.km,
                owner: user._id,
                image: req.file.path,
                roomName: room,
                postedAt: new Date().toDateString(),
                auctionDate: now.toDateString(),
                auctionTime: '10:00 A.M.',
                price: req.body.price
            });

            newCar.save()
            .then(res.redirect('/myCars'))
            .catch();
        }
    }) (req, res, next);
})

router.get('/car/:carid', function(req, res, next) {
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
                                owner,
                                user
                            });
                        }
                    })
                }
            })
        }

    }) (req, res, next);
});

router.get('/drive', (req, res) => {
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

router.get('/myCars', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        else if(!user) {
            return res.redirect('/login');
        }
        else {
            Car.find({owner: user._id})
            .then(cars => {
                if(!cars){
                    return console.log("You have no cars to sell");
                }
                else {
                    return res.render('userCars', {
                        cars,
                        user
                    })
                }
            })
        }
    }) (req, res, next)
})

router.get('/editPost/:carid', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        else if(!user) {
            return res.redirect('/login');
        }
        else {
            Car.findOne({_id: req.params.carid})
            .then(car => {
                if(!car) {
                    return console.log("Car not found!")
                }
                else {
                    return res.render('editPost', {
                        car,
                        user
                    })
                }
            })
        }
    }) (req, res, next)
});

router.post('/editPost/:carid', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        else if(!user) {
            return res.redirect('/login');
        }
        else {
            Car.findOne({_id: req.params.carid})
            .then(car => {
                if(!car) {
                    return console.log('Car not found')
                }
                else {
                    var room = req.body.brand + user.name.substr(0, user.name.indexOf(' '));
                    car.brand= req.body.brand,
                    car.model= req.body.model,
                    car.regState= req.body.regState,
                    car.regCity= req.body.regCity,
                    car.regYear= req.body.regYear,
                    car.km = req.body.km,
                    car.price = req.body.price,
                    car.roomName = room
                    car.save()
                    .then(res.redirect('/myCars'))
                    .catch()
                }
            })
        }
    }) (req, res, next)
});

router.post('/deletePost/:carid', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        else if(!user) {
            return res.redirect('/login');
        }
        else {
            Car.deleteOne({_id: req.params.carid})
            .then(res.redirect('/myCars'))
        }
    }) (req, res, next)
});

router.get('/myProfile/:username', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        else if(!user) {
            return res.redirect('/login');
        }
        else {
            User.findOne({_id: user._id})
            .then(user => {
                if(!user) {
                    return console.log("No user Profile");
                }
                else {
                    return res.render('userProfile', {
                        user
                    });
                }
            })
        }
    }) (req, res, next)
});

router.get('/editProfile/:username', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        else if(!user) {
            return res.redirect('/login');
        }
        else {
            User.findOne({_id: user._id})
            .then(user => {
                if(!user) {
                    return console.log("No user Profile");
                }
                else {
                    return res.render('editProfile', {
                        user
                    });
                }
            })
        }
    }) (req, res, next)
});

router.post('/editProfile/:username', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        else if(!user) {
            return res.redirect('/login');
        }
        else {
            const {errors, isValid} = validateRegisterInput(req.body);
            User.findOne({_id: user._id})
            .then(user => {
                if(!user) {
                    return console.log("No user Profile");
                }
                else {
                    if(!isValid){
                        return res.status(400).render('editProfile', {
                            errors: errors.email,
                            user
                        });
                    }
                    user.name = req.body.name,
                    user.email = req.body.email,
                    user.contactNumber = req.body.contact
                    user.save()
                    .then(
                        Car.find({owner: user._id})
                        .then(car => {
                            if(!car) {
                                return res.redirect(`/myProfile/${user.name}`)
                            }
                            else {
                                car.owner = user._id
                                return res.redirect(`/myProfile/${user.name}`)
                            }
                        }).catch()
                    ).catch()
                }
            });
        }
    }) (req, res, next)
});

router.get('/changePassword/:username', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        else if(!user) {
            return res.redirect('/login');
        }
        else {
            res.render('changePassword', {
                user
            })
        }
    }) (req, res, next)
});

router.post('/changePassword/:username', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        else if(!user) {
            return res.redirect('/login');
        }
        else {
            User.findOne({_id: user._id})
            .then(user => {
                if(!user) {
                    return console.log("No user Profile");
                }
                else {
                    const {errors, isValid} = validatePasswordInput(req.body);
                    bcrypt.compare(req.body.currPass, user.password)
                    .then(isMatch => {
                        if(!isMatch) {
                            errors.currPass = "Password Incorrect"
                            return res.render('changePassword', {
                                errors,
                                user
                            })
                        }
                        else if(errors.length == 0) {
                            return res.render('changePassword', {
                                errors,
                                user
                            })
                        }
                        else {
                            user.password = req.body.newPass
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(user.password, salt, (err, hash) => {
                                    if(err) throw err;
                                    user.password = hash;
                                    user.save()
                                        .then(res.redirect(`/myProfile/${user.name}`))
                                        .catch(err);
                                });
                            });
                        }
                    })  
                }
            })
        }
    }) (req, res, next)
});

router.get('/deleteUser/:username', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        else if(!user) {
            return res.redirect('/login');
        }
        else {
            res.render('deleteUser', {
                user
            })
        }
    }) (req, res, next)
});

router.post('/deleteUser/:username', function(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
        if(err) {
            return next(err);
        }
        else if(!user) {
            return res.redirect('/login');
        }
        else {
            bcrypt.compare(req.body.password, user.password)
                .then(isMatch => {
                    if(!isMatch) {
                        const error = "Password Incorrect"
                        return res.render('deleteUser', {
                            error,
                            user
                        })
                    }
                    else {
                        User.deleteOne({_id: user._id})
                        .then(
                            Car.deleteMany({owner: user._id})
                            .then(res.redirect('/signup'))
                            .catch()
                        )
                        .catch() 
                    }
                })  
        }
    }) (req, res, next)
});


module.exports = router;