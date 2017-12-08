var express = require('express');//
var port = process.env.PORT || 5000;//
var http = require('http');
var morgan = require('morgan');//
var path = require('path');//
var mongoose = require('mongoose');//
var session = require('express-session');//

var cookieParser = require('cookie-parser');//
var csrf = require('csurf');
var csrfProtection = csrf({cookie: true});
var bodyParser = require('body-parser');//
var parseForm = bodyParser.urlencoded({extended: false});
var MongoStore = require('connect-mongo')(session);//
var expressValidator = require('express-validator');//
var flash = require('connect-flash');//
var passport = require('passport');//
var config = require('./config/database');
var cors = require('cors')
var helmet = require('helmet');
var csp = require('helmet-csp');
var frameguard = require('frameguard');
var referrerPolicy = require('referrer-policy');


//INIT ES6 PROMISE
mongoose.Promise = global.Promise;

//CREATE DB CONN
//ALWAYS USE 'connection.openUri()' -- ALWAYS!!!!!!!!!!!!
mongoose.connection.openUri(config.db);

let db = mongoose.connection;

//check for db errors
db.on('error', (err) => {
	console.log(err);
});

db.once('open', ()=> {
	console.log('Connected to mongo db...');
});


//INIT APP
var app = express();

//helmet middleware
app.use(helmet.noCache());
app.use(csp({
	directives: {
		defaultSrc: ["'self'", 'maxcdn.bootstrapcdn.com', 'code.jquery.com', 'unpkg.com' ],
		styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com', "'unsafe-inline'"],
		scriptSrc: ["'self'", 'maxcdn.bootstrapcdn.com', 'code.jquery.com', "'unsafe-inline'", 'unpkg.com', 'https://code.jquery.com/jquery-3.2.1.min.js'],
		imgSrc: ["'self'", 'res.cloudinary.com', 'res.cloudinary.com/encry973r/image/upload/'],
		connectSrc: ['res.cloudinary.com/encry973r/image/upload/', "'self'", 'https://api.cloudinary.com/v1_1/encry973r/upload'] //for ajax request routes
	},
	browserSniff: false,
}));
app.use(frameguard({action: 'deny'}));
app.use(helmet.referrerPolicy({policy: 'same-origin'}));
//app.use(referrerPolicy({policy: 'no-referrer'}));

app.use(cors());

app.use(morgan('dev'));

/*var fs = require('fs')
var morgan = require('morgan')
var path = require('path')
var rfs = require('rotating-file-stream')

var app = express()
var logDirectory = path.join(__dirname, 'log')

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
var accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream, 
							skip: function (req, res) { return res.statusCode < 400 } // Logs only errors
			}));

app.get('/', function (req, res) {
  res.render('index');
})
*/
//INIT BODY-PARSER
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//INIT STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

/////////////////////////////////

app.use(cookieParser());

//Express session middleware
app.use(session({
	secret: config.secret,
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({ 
		mongooseConnection: mongoose.connection,
		ttl:  3 * 60 * 60 , // lasts for 3 hours
		touchAfter: 3.1 * 3600 //clear after 3hrs-6mins
		 })
}));

//Express Messages Middleware
app.use(require('connect-flash')()); 				///INIT FLASH
app.use(function(req, res, next){
	res.locals.messages = require('express-messages')(req, res);
	next();
});

//Express validator Middleware
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.'),
			root = namespace.shift(),
		formParam = root;

		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
		};
		
	}
}));

//Passport config
require('./config/passport')(passport);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
	res.locals.user = req.user || null;
	next();
});


////////////////////////////////

//SET VIEW PATH AND ENGINE
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'pug');

////////////////////////////////

///////////////////////////////////

//this model is for admins and normal-users
const Users = require('./api/models/userModel');
const Complaints = require('./api/models/supportModel');
const Displaylist = require('./api/models/displayListModel');
const AdminPasscode = require('./api/models/passcodeModel');

//IMPORT USER-ROUTE FILE
var userRoutes = require('./api/routes/userRoutes');
//IMPORT ADMIN-ROUTE FILE
var adminRoutes = require('./api/routes/adminRoutes');

//USE IMPORTED ROUTE
app.use('/users', userRoutes);
app.use('/medusa123', adminRoutes);


//HOME ROUTE
app.get('/', (req, res, next)=>{
	res.render('index');
});

//display login form
app.get('/users/login', csrfProtection, function(req, res, next){
	console.log({token: req.csrfToken()});
	res.render('login', {csrfToken: req.csrfToken()});
	//next();
});

//display login form
app.get('/medusa123/login', csrfProtection, function(req, res, next){
	console.log({token: req.csrfToken()});
	res.render('azbycx/login', {csrfToken: req.csrfToken()});
	//next();
});

/// error handlers
// development error handler
// will print stacktrace

app.use(function(err, req, res, next){
	if(err.code !== 'EBADCSRFTOKEN') return next(err);

	//handle CSRF token here
	res.status(403)
	res.render('403', {error: 'Form tampered with'});
	next();
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('404', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {

	res.status(err.status || 500);
	res.render('404', {
		message: err.message,
		error: {}
	});
	
	// console.log({message: err.message});
	// console.log({error: {}});
	// res.render('404', {message: "Something went wrong from the other side"})
});

//LISTEN 
 app.listen(port, function(){
	console.log("Connection made on port " + port);
});