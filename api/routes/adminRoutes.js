var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var adminController = require("../controllers/adminController");
var User = mongoose.model('User');

//const app = express();
//var csrf = require('csurf');
//var csrfProtection = csrf();


function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash('danger', 'Please login');
		res.redirect('/medusa123/login');
	}
}

function needsGroup(req, res, next){
	//return function(req, res, next){
		var username = req.body.username;
		//var password = req.body.password;

		User.findOne({username: username}, function(err, user){
			if(err){
				console.log(err);
				return;
			}

			if(user && user.admin == true){//if user
				//console.log(user);
				return next();
			}else if(user && user.admin == false){
				//res.send(401, 'Unauthorized');
				req.flash('danger', 'Please login');
				res.redirect('/users/login');
			}else if(!user){
				req.flash('danger', 'Wrong username and password combination');
				res.redirect('/users/login');
			}
		});
	//}
}


//display registeration form
	router.get('/register', adminController.get_admin_register_form);

		//Register admin 
	router.post('/register', adminController.register_admin);

	// 	//display login form
	// router.get('/login', adminController.get_admin_login_form);

		//log in admin
	router.post('/login', needsGroup, adminController.login_admin);

		//log out admin
	router.get('/logout', needsGroup, ensureAuthenticated, adminController.logout_admin);

		//load dashboard
	router.get('/dashboard', needsGroup, ensureAuthenticated, adminController.get_admin_dashboard);

		//load reservation list
	router.get('/reservation', needsGroup, ensureAuthenticated, adminController.get_admin_reservation_list);

	//load reservation list
	router.post('/publish', needsGroup, ensureAuthenticated, adminController.publish_list);

	//load reservation list
	router.post('/withdraw', needsGroup, ensureAuthenticated, adminController.withdraw_list);

	//approve downline
	router.post('/approvedownline', needsGroup, ensureAuthenticated, adminController.approve_admin_downline);

	//approve downline
	router.post('/approve-declined', needsGroup, ensureAuthenticated, adminController.approve_declined_downline);

	//approve downline
	router.post('/decline-declined', needsGroup, ensureAuthenticated, adminController.decline_declined_downline);

		//decline downline
	router.post('/declinedownline', needsGroup, ensureAuthenticated, adminController.decline_admin_downline);

	//approve-purged
	router.post('/approve-purged', needsGroup, ensureAuthenticated, adminController.approve_purged_downline);

	//decline downline
	router.post('/decline-purged', needsGroup, ensureAuthenticated, adminController.decline_purged_downline);

		//load profile
	router.get('/profile', needsGroup, ensureAuthenticated, adminController.get_admin_profile);

		//update profile
	router.post('/profile', needsGroup, ensureAuthenticated, adminController.update_admin_profile);

	//load transactions
	router.get('/transactions', needsGroup, ensureAuthenticated, adminController.get_admin_transactions);

	//get all registered users
	router.get('/users', needsGroup, ensureAuthenticated, adminController.get_all_registered_users);

	//get all registered admins
	router.get('/admins', needsGroup, ensureAuthenticated, adminController.get_all_registered_admins);
	//update-amount-remaining

	//get all registered admins
	router.post('/admins/update-amount-remaining', needsGroup, ensureAuthenticated, adminController.update_admin_amount_remaining);

	//get all registered admins
	router.get('/complaints', needsGroup, ensureAuthenticated, adminController.get_all_complaints);

	//get all declined transactions
	router.get('/declined-transactions', needsGroup, ensureAuthenticated, adminController.get_all_declined_transactions);

	//get all declined transactions
	router.get('/testimonies', needsGroup, ensureAuthenticated, adminController.get_all_testimonies);

	//get all declined transactions
	router.post('/reactivate-account', needsGroup, ensureAuthenticated, adminController.reactivate_account);

	//get all declined transactions
	router.get('/purge', needsGroup, ensureAuthenticated, adminController.get_purge_page); //get purge page so as to enable you purge defaulters
	
	//get all declined transactions
	router.post('/purge', needsGroup, ensureAuthenticated, adminController.purge); // Purge deafulters

	//get all declined transactions
	router.get('/purged-accounts', needsGroup, ensureAuthenticated, adminController.get_purged_accounts_page); // Purge deafulters

	module.exports = router;