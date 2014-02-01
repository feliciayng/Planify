/* EXPRESS */
var express = require('express');
// note Javascript has soft types 
var app = express();
// executes express as a function



// getting HTML to render, using  JADE;
// reference: http://goo.gl/4iqGh5
// app.set('public', __dirname + '/public');
// app.engine('html', require('ejs').renderFile);

// session store - require 'connect-mongo'



var db = require('./database/db.js');
var connect = db.connect;
var User = db.User; 
var Task = db.Task;

// use the following lines to deliver static pages
app.use(express.static(__dirname + '/public'));
app.use(express.compress());

app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.session({secret: 'princeton'}));


//USE THIS TO RENDER DYNAMIC PAGES WITH EJS
app.set('view engine', 'ejs');



// Express session code goes here

connect.on('error', console.error.bind(console, 'Failed to open connection:'));
connect.once('open', function callback() {

    // intuitively APP.GET allows users to pull information from your server
    // note, '/' is the home page
    // REQ and RES are objects created when user connects - REQUEST and RESPOND

    /// NEW FEATURE ///

    //WHEN THE USER ENTERS THE /SIGNUP URL, THIS CODE RENDERS THE SIGNUP HTML PAGE,
    //which redirects us to the /signup post code.
    app.get('/signup', function(req, res){
        /*
        if (req.session.loggedIn){
            res.send('YOU MUST LOG OUT.');
        } else {
            res.sendfile('./public/formDavid.html');
        }
        */

        //to make the site more streamlined, it makes sense to put "signup" and "login" on the same page
        res.redirect('../login');
    });

    app.get('/login', function(req, res){
        if (req.session.loggedIn){
            res.redirect('../home');
        } else {
            res.sendfile('./public/loginform.html');
        //from in the loginform.html, the user is sent to the localhost:8000/home url (look down)
        //GOES TO /HOME
        }
    });

    app.get('/', function(req, res){
        if (req.session.loggedIn){
            res.redirect('/home');
        } else {
            res.redirect('/login');
        }
    });

    // would need APP.POST -- then pull out the params from REQ object
    // THIS "GET" FUNCTION TESTS THE USER DATABASE
    app.get('/dbtest', function(req, res){
        var newUser = new User({
            "username": "David",
            "password": "pass123"
        });
        // this creates and saves a new user
        newUser.save(function (e){
            if (e){
                console.error.bind(console, 'Failed to create user:')
            }
            //else res.send("A new user has been created!");
        });
    });

    //THIS URL TESTS THE TASK DATABASE BY ADDING A NEW TASK.

    app.get('/biebertasks', function(req, res){

        var newTask = new Task({
            "username": "j",
            "taskname": "broccoli",
            "rating": 2,
            "durationmin": 15,
            "durationmax": 300
        });

        newTask.save(function(e){
            if(e){
                console.error.bind(console, 'Failed to create task!');
            }
            //else res.send("A new task has been created!");
        });

        var newTask = new Task({
            "username": "j",
            "taskname": "stargazing",
            "rating": 1,
            "durationmin": 15,
            "durationmax": 45
        });

        newTask.save(function(e){
            if(e){
                console.error.bind(console, 'Failed to create task!');
            }
            //else res.send("A new task has been created!");
        });

        res.send('Tasks created!');

    });

    app.get('/taskdbtest', function(req, res){
        var newTask = new Task({
            "username": "j",
            "taskname": "chicken souvlaki",
            "rating": 1.5,
            "durationmin": 0,
            "durationmax": 60
        });

        newTask.save(function(e){
            if(e){
                console.error.bind(console, 'Failed to create task!');
            }
            //else res.send("A new task has been created!");
        });
        
    });

    //GET HERE FROM "SIGN UP" HTML FORM
    //when successful, res.sends "signed up!"
    app.post('/signup', function(req, res){
        // var username = req.body.username;
        // var password = req.body.password;
        // console.log(username + " " + password);

        //search the database for the given username
        User.findOne({'username': String(req.body.username_init)}, 'firstname lastname password', function(err, user){
            if (!user) {
                //if the user is not in the database, sign them up. 
                var newUser = new User({
                    "username": String(req.body.username_init),
                    "password": String(req.body.password_init),
                    "firstname": String(req.body.firstname),
                    "lastname": String(req.body.lastname)
                });

                // this creates a new user
                newUser.save(function (e){
                    if (e){
                        console.error.bind(console, 'Database error: failed to create user!')
                    }
                    else {
                        res.send('Thank you for signing up! Go back to log in.')
                        //res.redirect('../login');
                    }
                });
            } 

            else{ //the user is already in the database
                console.log(String(req.body.username));
                res.send('This username is already registered.');
            }
        });       

    });

    //Get to this page from "login.html" form
    //Is there a way to create an alert, which allows the user to stay on the same page?
    app.post('/authentication', function(req, res){
        
        //Create variable to contain string USER.FIRSTNAME
        var userFirstName = '';
        // var myObject = {};
        //console.log("This is the username: "+String(req.body.username));                
        
        //Checks credentials and renders the individual page
        User.findOne({'username': String(req.body.username)}, 'username firstname lastname password', function(err, user){
            // console.log(err); THIS DOESN'T WORK
            
            if (!user) {
                req.session.loggedIn = false;
                //res.redirect('../login');
                res.send("You are not a registered user here. Please sign up.")
            }
                //if the user is not in the database, say "not in database..."
                //when query fails to return a match, USER variable has value "null"
            
            else {
                if (String(req.body.password) === user.password) {
                    console.log('%s %s is in the database', user.firstname, user.lastname);
                    req.session.userID = String(user.username);
                    req.session.loggedIn = true;

                    req.session.userFirstName = String(user.firstname);

                    //if the password entered matches the user's password, bring the user to their homepage
                    res.redirect('../home');
                    
                } 
                
                else { //TRY TO CREATE AN ALERT HERE!! Wasn't able to.. :(
                    req.session.loggedIn = false;
                    //res.redirect('../login');
                    //res.send("Wrong password!");
                    
                    //Should(hopefully) get the jquery code in "loginform" to display an alert
                    res.send("wrong password!");
                    
                    //Try to create an alert; don't just redirect with "res.send..."
                }                
            }

        // page-rendering happens here
        if (!req.session.userFirstName) {} //this means that the user's password was incorrect; so do nothing.

        else{
            // console.log(myObject);
            //The User's password has matched
            //SEND THEM TO HOME SCREEN
            res.redirect('../home');
            //res.send('Hello, ' + userFirstName + '!');
        }


        });
        // var meme = User.findOne({'firstname': 'David'})
        // console.log(meme.select('username'));
        



    });

    app.get('/home', function(req, res){
        if (!req.session.loggedIn){
            res.redirect('../login');
        } else {
            Task.findOne({'username': String(req.session.userID)}, 'taskname rating', function(err, task){
                //search for any task from a given user, get back task name and rating.
                if(!task) {
                    //if the user has no tasks:
                    res.render('home', {
                        firstname: req.session.userFirstName,
                        taskname: "Enter new task at 'Task Manager' Page!"
                    });
                }

                else {
                    //if a task was found:
                    //res.send('Hello, '+ userFirstName + ', your recommended task is: '+ String(task.taskname));
                    res.render('home', {
                        firstname: req.session.userFirstName,
                        taskname: String(task.taskname)
                    });
                }
            });
        }
    });


    //TASKS PAGE OF THIS DOCUMENT WAS MODIFIED TO DISPLAY OTHER TASK ELEMENTS.
    //You can access this by links from the homepage, etc.
    app.get('/tasks', function(req, res) {
        // var myObject = [];

        if (!req.session.loggedIn){
            res.redirect('../login');
        } else {


        //Insert QUERY code here
        //FOR COLLIN: WHY CAN'T WE CREATE "USERTASKS" OUTSIDE OF TASKQUERY????
            var taskQuery = Task.find({"username": String(req.session.userID)}, 'taskname rating durationmin durationmax mood').sort({rating: 'desc'});
            taskQuery.exec(function(err, docs){
                // console.log('1')
                
                var testvar = docs; //.slice(0,5);
                // console.log(testvar);
                // console.log(docs[1].taskname);


                // myObject = JSON.parse(JSON.stringify(docs));
                // console.log('new myObject is ' + typeof(myObject));
                // console.log(myObject);
                // console.log(typeof(docs));
                // console.log(docs);

                var moods=[];                
                var durations=[];
                var ratings=[];
                var usertasks=[];
                for (i=0; i<testvar.length; i++){
                    //TASKNAME
                    usertasks[i] = String(testvar[i].taskname);
                    
                    //RATING
                    if(!testvar[i].rating){
                        ratings[i] = "unspecified";
                    }
                    else {
                        ratings[i] = String(testvar[i].rating);
                    }
                    
                    //MIN AND MAX DURATIONS
                    if((!testvar[i].durationmin) && (!testvar[i].durationmax)) {
                        durations[i]="not specified";                                                
                    }
                    else {                        
                        durations[i] = String(testvar[i].durationmin)+" to "+String(testvar[i].durationmax)+" min";                        
                    }

                    //MOOD
                    if(!testvar[i].mood) {
                        moods[i] = "unspecified";
                        console.log(moods[i], testvar[i].mood);
                    }
                    else {
                        moods[i] = String(testvar[i].mood);
                    }

                    
                }
                // NOTE: the "correct" paradigm of JavaScript programming is to nest callback functions, which preserves variable scope, and functions that require those arguments inside of nested callback functions
                res.render('taskpage', {
                    tasklist: usertasks,
                    moodlist: moods,
                    ratinglist: ratings,
                    durationlist: durations
                });
            });
        }

        // console.log('2');

        // console.log(usertasks);

        // for (i=0; i<usertasks.length; i++){
        //     usertasks[i] = String(usertasks[i].taskname);
        // }

        // console.log('3');

        // console.log(usertasks);

        // // usertasks[0] = "chicken";
        // res.render('taskpage', {
        //     tasklist: usertasks
        // });
    });



    /////// *** QUERY DEV CODE HERE *** ///////
    app.get('/tasktest', function(req, res){
        // (1): Query database to find unique TASK NAMES
        var QueryUniqueTask = Task.find().distinct('taskname');
        QueryUniqueTask.exec(function(err, taskArray){
            // YES, this returns a list of the unique values of TASKNAME
            // console.log(taskArray);
            for (j in taskArray){
                console.log(taskArray[j])
                // var QueryRating = Task.find({'taskname': taskArray[j]})
                ;
            }
        });

        // CODE BELOW *is* OPERATIONAL
        // var AvgRating = Task.aggregate([
        //     {$group: {
        //         _id: '$taskname',
        //         ratingAvg: {$avg: '$rating'}
        //     }}
        // ], function(err, results){
        //     if (err){
        //         console.error(err);
        //     } else {
        //         console.log(results);
        //     }
        // });

        var QueryRating = Task.aggregate([
            {$group: {
                _id: '$taskname',
                ratingAvg: {$avg: '$rating'}
            }}
        ]);

        QueryRating.sort({ratingAvg: 'desc'}).exec(function(err, results){
            if (err){
                console.error(err);
            } else {
                var topFive = results.slice(0,5);
                console.log(topFive);
            }
        });

        // (x): Finished, look at log
        res.send('Finished. Check out your log!');
    });

    
    //the tasks/create url is only for recieving "new task" requests
    app.post('/tasks/create', function(req,res){
        //use a query to check if the task already exists
        //if not, create it.
        //res.send("Coming soon!");

        //use a query to check if the task already exists
        var NewTask_Query = Task.findOne({"username": String(req.session.userID), "taskname":req.body.newtaskname}, 
            function(err, task){
            //search for the given task. If it is found, alert the user.
            if(task) {
                res.send("that task has already been created.");
            }
            else {
                //create a new task with the specified name, if we know it's not in the database.
                var newTask = new Task({
                    "username": String(req.session.userID),
                    "taskname": String(req.body.newtaskname),
                    "rating": Number(req.body.rating),
                    "durationmin": Number(req.body.durationmin),
                    "durationmax": Number(req.body.durationmax),
                    "mood": String(req.body.mood),
                    "frequency": 0

                });

                newTask.save(function(e){
                    if(e){
                        console.error.bind(console, 'Database error: failed to create task.');
                    }

                    else {
                        //res.send("new task created!");
                        res.redirect('../');
                    }
                });
            }
        });
        //if not, create it.
        //res.send("Coming soon!");
    });

    app.get('/tasks/create', function(req,res){
        res.redirect('../');
    });

    //the tasks/edit url is only for recieving "edit task" requests
    app.post('/tasks/edit', function(req, res){
        //res.send("coming soon!");

        var editTaskQuery = {'username': req.session.userID, 'taskname': req.body.editTaskName};

        Task.findOneAndRemove(editTaskQuery, function(err, task){            
            //for the rating, min and max durations, and moods, check if user changed value. If so, store changes in local vbls.
            if(!task) {
                res.send("Your task could not be found in the database.");
            }

            var editRating = task.rating;
            if(req.body.editRating) {
                editRating = req.body.editRating;
            } 

            var editMinDuration = task.durationmin;
            if(req.body.editMinDuration) {
                editMinDuration = req.body.editMinDuration;
            }

            var editMaxDuration = task.durationmax;
            if(req.body.editMaxDuration) {
                editMaxDuration = req.body.editMaxDuration;
            }

            var editMood = task.mood;
            if(req.body.mood) {
                editMood = req.body.editMood;
            }

            
            //create a new "edited task" and store it in the database.
            editedTask = new Task({
                "username": req.session.userID,
                "taskname": task.taskname,
                "mood": editMood,
                "rating": editRating,
                "durationmax": editMaxDuration,
                "durationmin": editMinDuration,
                "frequency":task.frequency
            });

            editedTask.save(function (e){
                if (e){
                    console.error.bind(console, 'Database error: failed to edit task.');
                }
                else {
                    res.redirect('../');
                }
            });


        });
    });

    app.get('/tasks/edit', function(req, res){
        res.redirect('../');
    });


    //PAGE FOR MESSING AROUND WITH QUERIES
    //FIRST NAVIGATE TO /TASKDBTEST
    //PAGE FOR MESSING AROUND WITH QUERIES
    //FIRST NAVIGATE TO /TASKDBTEST
    app.get('/home2', function(req, res){
        if (!req.session.loggedIn){
            res.redirect('../login');
        } else {
        //Insert QUERY code here
            var taskQuery = Task.find({"username": String(req.session.userID)}, 'taskname rating').sort({rating: 'desc'});
            taskQuery.exec(function(err, docs){
                // console.log(docs):
                console.log(docs.slice(0,5));
                console.log(docs[1].taskname);
            });
            res.send('CODE GOES HERE.');
        }
    });




    app.get('/recommender', function(req, res){
        if (!req.session.loggedIn){
            res.redirect('../login');
        } else {
            res.sendfile('./public/recommendform.html');
        }
    });

    app.post('/recommended', function(req, res){
        //posted data: userMood and userTime
        if (!req.session.loggedIn){
            res.redirect('../login');
        } else {
            //here we've confirmed that the user is logged in
            var userMood = String(req.body.userMood);
            var userTime = -1;
            if (userTime !== null){
                userTime = Number(req.body.userTime);
            }
            if ((req.body.userMood === '') || (req.body.userTime < 1)){
                res.send('Can\'t complete the search; please try again!');
            } else {
                //now we perform aggregation to generate suggested tasks from all users
                var QueryRating = Task.aggregate([
                    {$match: {
                        mood: userMood,
                        durationmin: {$lte: userTime},
                        durationmax: {$gte: userTime}
                    }},
                    {$group: {
                        _id: '$taskname',
                        ratingAvg: {$avg: '$rating'}
                    }}
                ]);

                if (QueryRating === null){
                    res.send('No tasks found. Please try another search!');
                } else {
                    //Once the aggregation is done, sort by rating
                    QueryRating.sort({ratingAvg: 'desc'}).exec(function(err, allResults){
                        //Inside the callback function, do another (user-specific) aggregation
                        var MyQuery = Task.aggregate([
                            {$match: {
                                username: String(req.session.userID),
                                mood: userMood,
                                durationmin: {$lte: userTime},
                                durationmax: {$gte: userTime}
                            }},
                            {$group: {
                                _id: '$taskname',
                                ratingAvg: {$avg: '$rating'}
                            }}
                        ]);

                        //Sort this query as well
                        MyQuery.sort({ratingAvg: 'desc'}).exec(function(err, myResults){
                            //Inside both callback functions
                            //Next define variables to pass to ejs render

                            console.log(myResults);
                            console.log(allResults)



                            var alltasks = [];
                            var allratings = [];
                            var mytasks = [];
                            var myratings = [];

                            if (allResults.length > 5){
                                allResults = allResults.slice(0,5);
                            }
                            if (myResults.length > 5){
                                myResults = myResults.slice(0,5);
                            }

                            //Populate list of rec's from all users
                            for (i=0; i<allResults.length; i++){
                                alltasks[i] = String(allResults[i]._id);
                                allratings[i] = Number(allResults[i].ratingAvg);
                            }

                            //Populate list of rec's from this user
                            for (i=0; i<myResults.length; i++){
                                mytasks[i] = String(myResults[i]._id);
                                myratings[i] = Number(myResults[i].ratingAvg);
                            }

                            // res.send('Check your log!');

                            // console.log(alltasks);
                            // console.log(allratings);
                            console.log(mytasks);
                            console.log(myratings);


                            //***FINALLY*** render inside the callback function
                            res.render('recommendpage', {
                                listAll: alltasks,
                                rateAll: allratings,
                                listMe: mytasks,
                                rateMe: myratings
                            });
                        });

                    });
                }

            }


        }


    });


    //renders an ejs which will make a "GET" request to the next url to create a piechart
    app.get('/history', function(req, res){
        if(!req.session.loggedIn){
            res.redirect('../login');
        }
        //res.send("coming soon!");
        res.render('taskPieChart.ejs', {
            firstname: String(req.session.userFirstName)
        });
    });

    //ejs from previous URL will make a "GET" request here to create a piechart.
    app.get('/history/piechart', function(req, res){

            //res.send("Coming Soon!");

            var taskQuery = Task.find({"username": String(req.session.userID)}, 'taskname frequency')//.sort({frequency: 'desc'});
            taskQuery.exec(function(err, finds) {

                var docs = find.slice(0, 5);
                var frequencies = [];
                var tasks=[];
                tasks.push('breathing');
                frequencies.push(100);

                for(var i=0; i< docs.length; i++) {
                    if(docs[i].frequency){
                        tasks.push(docs[i].taskname);
                        frequencies.push(docs[i].frequency);
                    }                    
                }

                //some crazy jquery stuff - create and send a JSON object with the correct data.
                //res.header("Access-Control-Allow-Origin", "*"); (apparently express does it automatically)
                str='['
                res.writeHead(200, {'Content-type':'text/json'});
                for(var i=0; i<tasks.length+1; i++) {
                    str = str + '{"taskname":"' + task[i] + '","frequency":"' + frequency[i] + '"},';
                }
                str = str.substring(0,str.length-1);
                str = str + ']';
                res.end(JSON.stringify(str)); //(apparently express does it automatically though)?
            });           
            
    });

    //"get"s the url "/logout"; sets the 'logged in' parameter to false and displays the logout page.
    //all pages will contain links to this page.
    app.get('/logout', function(req, res){
        req.session.loggedIn = false;
        req.session.userID = '';
        res.sendfile('./public/logoutscreen.html');
    });



    // something more interactive
    // the COLON : is variable notation
    // note that this syntax is used all the time, e.g. Google, Facebook
    // app.get('/name/:myname', function(req, res){
    //     res.send('My name is ' + req.params.myname + '.')
    // });


    app.get('/makefounderdb', function(req, res){

        //"connect" contains the db export from db.js
        connect.db.dropCollection('tasks', function(err, result){});

        seedArray = [
            ["founder", "study", "productive", 2, 15, 45, 1],
            ["founder", "play Xbox", "fun", 4.5, 30, 180, 1],
            ["founder", "use Codecademy", "productive", 5, 10, 60, 1],
            ["founder", "surf the web", "relaxing", 4.2, 5, 180, 1],
            ["founder", "read the New York Times", "relaxing", 4.6, 10, 30, 1],
            ["founder", "call your parents", "productive", 4.9, 5, 20, 1],
            ["founder", "chat on tigersanonymous", "fun", 4.8, 0, 15, 1]
            ["bieber", "study", "productive", 4.4, 30, 90, 1],
            ["bieber", "use Codecademy", "productive", 5, 5, 90, 1],
            ["bieber", "call your parents", "productive", 3.5, 2, 20]
        ];

        //double-bracket reference to nested arrays is OK
        // for (j in seedArray){
        //     console.log(seedArray[j][1]);            
        // }

        for (j in seedArray){

            // console.log(seedArray[j][1]);
            // console.log(j);
            // var m = j;

            // Task.findOne({"username": "founder", "taskname": String(seedArray[j][1])}, "taskname", function(err, task){
            //     if (!task) {

                    var newTask = new Task({
                        "username": seedArray[j][0],
                        "taskname": seedArray[j][1],
                        "mood": seedArray[j][2],
                        "rating": seedArray[j][3],
                        "durationmin": seedArray[j][4],
                        "durationmax": seedArray[j][5],
                        "frequency": seedArray[j][6]
                    });
                    console.log(seedArray[j][1]);
                    // console.log(j);
                    // console.log(m);
                    console.log(newTask);

                    newTask.save(function(e){
                        if(e){
                            console.error.bind(console, 'Database error: failed to create task.');
                        } else {
                            console.log('New task created!');
                        }
                    });
                // }
            // });
        }
        //NOW ALL ENTRIES HAVE BEEN CREATED/SKIPPED

        res.send('Finished. Read the log and check mongo!');
    });
    
    /// ** DEV CODE **
    /// scan task database for all productive tasks
    /// then computes the average rating for all productive tasks
    /// and sorts by best rating
    app.get('/productive', function(req, res){

    });

});




app.listen(8000);
// this instructs the script to sit at "localhost:8000"
