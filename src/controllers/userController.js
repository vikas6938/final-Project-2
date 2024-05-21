const userModel = require('../models/userModel');
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const productModel = require('../models/productModel');

const userController = {
    signup: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const user = await userModel.findOne({ email });

            // Check if the user already exists
            if (user) {
                return res.status(401).redirect('/user/signup');
            }

            // Hashing Password
            const _SALT_ROUND = 10;
            const hashedPassword = await bcryptjs.hash(password, _SALT_ROUND);

            // Create User
            const newUser = await userModel.create({ name, email, password: hashedPassword });

            // Generate OTP
            const OTP = generateOTP();
            const otpExpiration = new Date(Date.now() + 4 * 60 * 1000);
            req.session.otp = OTP;
            req.session.user = newUser;
            req.session.otpExpiration = otpExpiration;

            // Send OTP to user's email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'vikasborse000@gmail.com',
                    pass: 'ekvu qvws lctd dgda'
                }
            });

            const mailOptions = {
                from: 'vikasborse000@gmail.com',
                to: newUser.email,
                subject: 'Signup OTP',
                html: `
                    <p>Hello, ${newUser.name}</p>
                    <p>Your One-Time Password (OTP) for signup is: <strong>${OTP}</strong></p>
                    <p>Please enter this OTP within 4 minutes to complete your signup process.</p>
                    <p>For security purposes, please refrain from sharing this OTP with anyone.</p>
                `
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.redirect('/user/otpverification');
        } catch (error) {
            console.log(error);
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await userModel.findOne({ email });

            if (!user) {
                return res.status(401).redirect('/user/signup');
            }

            const isVerify = await bcryptjs.compare(password, user.password);

            if (!isVerify) {
                return res.status(401).redirect('back');
            }

            // Token Generate
            const payload = {
                sub: user._id,
                user: user.name,
                role: user.role
            };

            const secret = "secret_Key";

            const token = jwt.sign(payload, secret, {
                expiresIn: "1d"
            });

            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 // 24 Hr
            });

            if (user.role == "user") {
                res.redirect('/user/user');
            } else {
                res.redirect('/');
            }

        } catch (error) {
            console.log(error);
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie("token");
            res.redirect('/user/login');
        } catch (error) {
            console.log(error);
        }
    },
    loginForm: async (req, res) => {
        try {
            res.render('Pages/user/loginForm');
        } catch (error) {
            console.log(error);
        }
    },
    signupForm: async (req, res) => {
        try {
            res.render('Pages/user/signupForm');
        } catch (error) {
            console.log(error);
        }
    },
    userPage: async (req, res) => {
        try {
            const products = await productModel.find().populate({
                path: 'subCategoryID',
                populate: {
                    path: 'categoryID'
                }
            });
            res.render('Pages/user/user', { products: products });
        } catch (error) {
            console.log(error);
        }
    },
    otpForm: async (req, res) => {
        try {
            res.render('Pages/user/otpForm');
        } catch (error) {
            console.log(error);
        }
    },
    otpVerify: async (req, res) => {
        try {
            const { otp } = req.body;
            const userOTP = req.session.otp;
            const user = req.session.user;
            const otpExpiration = req.session.otpExpiration;

            if (otp === userOTP && new Date() < new Date(otpExpiration)) {
                delete req.session.otp;
                delete req.session.otpExpiration;
                delete req.session.user;

                res.redirect('/user/login');
            } else {
                res.redirect('/user/otpverification');
            }
        } catch (error) {
            console.log(error);
        }
    }
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = userController;
