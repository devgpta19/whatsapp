var express = require('express');
var router = express.Router();
var userModel = require('./users')
const messageModel = require('./message')
var users = require('./users')
var passport = require('passport')
var localStrategy = require('passport-local')
passport.use(new localStrategy(users.authenticate()))

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index');
});


router.post('/register', function (req, res, next) {
  var newUser = {

    username: req.body.username,
    email: req.body.email,

  }
  userModel
    .register(newUser, req.body.password)
    .then( function(result) {
      passport.authenticate('local')(req, res, () => {

        res.redirect('/home')
      });
    })
    .catch((err) => {
      res.send(err);
    });
});


router.get('/login', function (req, res, next) {
  res.render('login')
})

router.post('/login',passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
  }),
  function (req, res, next){}
);

function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect('/login');
}

router.get('/logout', (req, res, next) => {
  if (req.isAuthenticated())
    req.logout((err) => {
      if (err) res.send(err);
      else res.redirect('/');
    });
  else {
    res.redirect('/');
  }
});

router.get('/home', isloggedIn, async function(req,res,next){
  const loggedInUser = await userModel.findOne({
    username:req.user.username
  }).populate('friends')
  console.log(loggedInUser)

  res.render('home',{
    loggedInUser
  })
})

router.post('/searchUser', isloggedIn, async function(req, res, next){
  const data = req.body.data


  const allUsers = await userModel.find({
    username:{
      $regex:data,
      $options:'i'
    }
  })

  console.log(allUsers);

  res.status(200).json(allUsers)

})

router.post('/addFriend', isloggedIn, async function(req, res, next){
  const friendId = req.body.friendId

  const friendUser = await userModel.findOne({
    _id: friendId
  })

  const loggedInUser = await userModel.findOne({
    username: req.session.passport.user
  })

  const indexOfFriendUser = loggedInUser.friends.indexOf(friendUser._id)

  if(indexOfFriendUser !== -1){
    res.status(200).json({
      message: 'already friends'
    })
    return
  }

  loggedInUser.friends.push(friendUser._id)
  friendUser.friends.push(loggedInUser._id)

  await loggedInUser.save()
  await friendUser.save()

  res.status(200).json({
    message:"friend added"
  })

})

module.exports = router;