const isEmpty = require('./is-empty');

const Validator = require('validator');

module.exports = function validatePasswordInput(data) {
    let errors = {};

    data.currPass = !isEmpty(data.currPass) ? data.currPass : '';
    data.newPass = !isEmpty(data.newPass) ? data.newPass : '';
    data.confirmPass = !isEmpty(data.confirmPass) ? data.confirmPass : '';

    if(!Validator.isLength(data.newPass, {min: 6, max: 30})){
        errors.newPass = "Password must be atleast 6 characters";
    }

    if(Validator.isEmpty(data.currPass)){
        errors.currPass = "Current password field is required.";
    }

    if(!Validator.equals(data.newPass, data.confirmPass)){
        errors.confirmPass = "Passwords must match."
    }

    if(Validator.isEmpty(data.confirmPass)){
        errors.confirmPass = "Confirm password field is required.";
    }

    return{
        errors, 
        isValid: isEmpty(errors)
    };
};