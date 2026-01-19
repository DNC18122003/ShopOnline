const passport = require('passport');
// import passport-jwt strategy
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
