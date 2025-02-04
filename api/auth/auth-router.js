const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const { JWT_SECRET } = require("../secrets"); // use this secret!
const bcrypt = require('bcryptjs');
const User = require('../users/users-model');
const jwt = require('jsonwebtoken');

//json web token for building our token on login, below
function buildToken(user){
  const payload = {
    subject: user.user_id,
    role_name: user.role_name,
    username: user.username
  };
  const options = {
    expiresIn: '1d',
  };
  return jwt.sign(payload,JWT_SECRET,options);
}

router.post("/register", validateRoleName, (req, res, next) => {
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
  const {username, password} = req.body;
  const {role_name} = req;
  const hashr = bcrypt.hashSync(password,8); //8 is of course a holy number

  User.add({username, password: hashr, role_name})
    .then(registered=>{
      res.status(201).json(registered)
    })
    .catch(next)
});


router.post("/login", checkUsernameExists, (req, res, next) => {
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
  //check that the hashes match !
  if (bcrypt.compareSync(req.body.password, req.user.password)){
    const token = buildToken(req.user);
    res.status(200).json({message:`${req.user.username} is back!`, token});
  } else {
    next({status: 401, message: 'Invalid credentials'})
  }
});

module.exports = router;
