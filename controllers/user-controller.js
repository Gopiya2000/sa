var User = require('../model/User');
var blogs = require('./blog-controller');
var profile = require('./profile-controller');
var bcrypt = require('bcryptjs');
const { validateName, validateEmail, validateUsername, validateMobile, validateDate, validatePassword, validateConfirm } = require('./Validation')
const sendToken = require('../utils/jwtToken')
require('dotenv').config()


const getAllUser = async (req, res, next) => {
    let users;
    try {
        users = await User.find();
    } catch (err) {
        console.log(err);
    }
    if (!users) {
        return res.status(404).json({ message: "No Users found " });
    }
    return res.status(200).json({ users });
};

const signup = async (req, res, next) => {
    const { name, email, username, mobile, date, password, confirm, blogs } = req.body;

    const nameResult = validateName(name, 1)
    const emailResult = validateEmail(email, 1)
    const usernameResult = validateUsername(username, 1)
    const mobileResult = validateMobile(mobile, 1)
    const dateResult = validateDate(date, 1)
    const passwordResult = validatePassword(password, 1)
    const confirmResult = validateConfirm(password,confirm)

    console.log(nameResult, emailResult, usernameResult, mobileResult, dateResult, passwordResult,confirmResult)
    
    if (nameResult == true && emailResult == true && usernameResult == true && mobileResult == true && dateResult == true && passwordResult == true && confirmResult == true)
    
    {
        let existingUser;
        try {
            let options = { abortEarly : false }
            existingUser = await User.findOne({ username });
        } catch (err) {
            console.log(err);
        }
        if (existingUser) {
            return res.status(400).json({ message: "User already exists.Login instead." })
        }
        //if (password == confirm) {
        const hashedPassword = bcrypt.hashSync(password, 12);
        const hashedConfirm = bcrypt.hashSync(confirm, 12);

        const user = new User({
            name,
            email,
            username,
            mobile,
            date,
            password: hashedPassword,
            confirm: hashedConfirm,
            // blogs:[],
            // profile:[]
        });

        try {
            await user.save();
        } catch (err) {
            return console.log(err);
        }
        const message = "Successfully signed in"
        sendToken(existingUser, 201, res, message)

    }
    return res.status(404).json({ message: "Unable to add user", errors: { name: nameResult, email: emailResult, username: usernameResult, mobile: mobileResult, date: dateResult, password: passwordResult ,confirm : confirmResult} })
};


const login = async (req, res, next) => {
    const { username, password } = req.body;
    let existingUser;
    try {
        let options = { abortEarly : false }
        existingUser = await User.findOne({ username });
    } catch (err) {
        console.log(err);
    }
    if (!existingUser) {
        return res.status(404).json({ message: "Couldn't find user by this username" });
    }
    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect Password" })
    }
    const message = "Successfully logged in"
    sendToken(existingUser, 200, res, message); 

}



module.exports = {
    getUser: getAllUser,
    signUp: signup,
    login: login
}
