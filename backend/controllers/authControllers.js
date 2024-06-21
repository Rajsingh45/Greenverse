const express = require('express');
const router = express.Router();
const User = require('../models/USER');
const {jwtAuthMiddleware, generateToken} = require('../jwt');



const checkAdminRole = async (userID) => {
    try{
         const user = await User.findById(userID);
         if(user.role === 'admin'){
             return true;
         }
    }catch(err){
         return false;
    }
 }