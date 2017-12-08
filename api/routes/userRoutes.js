//'use strict';
//var session = require('express-session');//
//var csrf = require('csurf');
//var csrfProtection = csrf();

var express = require('express');

var router = express.Router();
var userController = require("../controllers/userController");
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');
var cors = require('cors');

//file upload
var cloudinary = require('cloudinary');
var cloudinaryStorage = require('multer-storage-cloudinary');
var multer = require('multer');

cloudinary.config({
	cloud_name:	'encry973r',
	api_key:	'189845742777529',
	api_secret:	'N3dsDl4TIHtJYiE1LHnTtTc3vXQ'
});

var storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'encry973r',
  allowedFormats: ['jpg', 'png', 'jpeg', 'PNG'],
  filename: function (req, file, cb) {
    cb(undefined, 'my-file-name');
  }
});
 
var parser = multer({ storage: storage });

/*const multer = require('multer');
const storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, 'public/uploads/');
	},
	filename: function(req, file, cb){
		cb(null, Date.now() + file.originalname);

	}
});
var upload = multer({storage: storage});
*/

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash('danger', 'Please login');
		res.redirect('/users/login');
	}
}

function needsGroup(req, res, next){
		var username = req.body.username;

		User.findOne({username: username}, function(err, user){
			if(err){
				console.log(err);
				return;
			}

			if(user && user.admin == false){//if user
				//console.log(user);
				return next();
			}else if(user && user.admin == true){
				//res.send(401, 'Unauthorized');
				req.flash('danger', 'Please login');
				res.redirect('/medusa123/login');
			}else if(!user){
				req.flash('danger', 'Wrong username and password combination');
				res.redirect('/users/login');
			}
		});
}

/*//checkSecretWord
function checkSecretWord(req, res, next){
	var secret = req.body.secret;

	if(secret == ''){
		req.flash('danger', 'Secret word annot be empty');
		res.redirect('/users/register');
	}else{
		next();
	}
}*/

function checkSuspended(req, res, next){
	var username = req.body.username;

	User.findOne({username: username}, function(err, user){ //make sure you use findOne if it is one decument you want!!!!!!!!!!! (lesson life)
		var date = new Date();
		var now = date.getTime();

		if(user.suspended == true){
			var suspensionTime = user.suspensionTime;

				//check if suspension time has elapsed
			if(suspensionTime > now){
				//let the user login so as to enable hi/her send a message to admin.
				next();
				//var suspensionTime = user.suspensionTime;
				//var timeLeft = suspensionTime - now;
				//timeLeft = parseInt(timeLeft/(1000*3600));
				//if not
				//req.flash('danger', 'Your account has been suspend. Would be reactivated in '+ timeLeft + ' hrs time');
				//res.redirect('login');
			}else{
					//if time has elapsed, reactivate user.
				User.update({username: username}, {$set: {suspended: false, suspensionTime: 0}}, function(err, active){
					if(err){
						console.log(err);
						return;
					}
					
					next();
				});
			}

		}else{
			//if suspension time 
			next();// not suspended
		}
		
	});
}

	router.use(cors());

		//display registeration form
	router.get('/register', userController.get_register_form);

		//Register user 
	router.post('/register', userController.register_user);

		//this route was transfered to the entry-file(app.js) of this project
		//display login form
	//router.get('/login', userController.get_login_form);

		//log in user
	router.post('/login', needsGroup, checkSuspended, userController.login_user);

		//log out user
	router.get('/logout', userController.logout_user);//don't add ensure aunthencated here... To avoid hanging...

		//reset-passwd
	router.get('/reset-passwd', userController.get_reset_passwd_page);
		
		//reset-passwd
	router.post('/reset-passwd', userController.post_to_reset_passwd);

		//load dashboard
	router.get('/dashboard', ensureAuthenticated, userController.get_dashboard);

		//load reservation list
	router.get('/reservation', ensureAuthenticated, userController.get_reservation_list);

	//load reservation list
	router.get('/payment', ensureAuthenticated, userController.get_payment_page);//
	
	//load reservation list
	router.post('/payment', ensureAuthenticated, userController.post_to_payment_page);//get_payment_page

		//update profile
	router.post('/upload', ensureAuthenticated, userController.upload_pop);//

/*		//update profile
	router.get('/up',  userController.get_upload_page);//

		//update profile
	router.post('/up', parser.array('images', 2), function (req, res) {
  		console.log(req.files);
  		res.send(req.files);
	});//*/

	//load reservation list
	router.post('/payment/amountRemaining', ensureAuthenticated, userController.get_current_ammountRemaining);

		//submit reservation request
	router.post('/submitreservation', ensureAuthenticated, userController.submitreservation);

		//approve downline
	router.post('/approvedownline', ensureAuthenticated, userController.approve_downline); //

		//decline downline
	router.post('/declinedownline', ensureAuthenticated, userController.decline_downline);

		//load profile
	router.get('/profile', ensureAuthenticated, userController.get_profile);//08034798879//joshua

		//update profile
	router.post('/profile', ensureAuthenticated, userController.update_profile);

		//load support
	router.get('/support', ensureAuthenticated, userController.get_support);

	//load support
	router.post('/support', ensureAuthenticated, userController.send_complaint);

		//load blog
	router.get('/blog', ensureAuthenticated, userController.get_blog);

		//load transactions
	router.get('/transactions', ensureAuthenticated, userController.get_transactions);

		//load inbox
	router.get('/inbox', ensureAuthenticated, userController.get_inbox);

/*		//load transactions
	router.get('/testimony', ensureAuthenticated, userController.get_testimony_page);
	
	//load transactions
	router.post('/testimony', ensureAuthenticated, userController.submit_testimony);
*/
	/*//load transactions
	router.get('/testimonies-to-home', ensureAuthenticated, userController.submit_testimonies_to_home);
*/

	module.exports = router;