'use strict';
var http = require('http');
var express = require('express');
var app = express();
var session = require('client-sessions');
var sql = require('mssql');
var sqlString = require('sqlstring');
var database = require('./public/js/database');
var db = new database.Database();
var bodyParser = require('body-parser');
var path = require('path');
//need these commands to get parameters for the post
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//DB Required modules----------------------------------
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var DBRequest = require('./DBRequest.js');
var DB = new DBRequest();
var async = require('async');
//------------------------------------
app.use(express.static(path.join(__dirname, '/public/')));
//app.use('/js', express.static(__dirname + '/js'));
//app.use('/css', express.static(__dirname + '/css'));
app.use(session({
    cookieName: 'session',
    secret: 'shouldbearandomstring',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));
var config = {
    userName: 'alexkas', // update me
    password: 'Alex0101', // update me
    server: 'cs275.database.windows.net',
    options: {
        encrypt: true,
        database: 'FinalProj'
    }
}

var connection = new Connection(config);
connection.on('connect', function (err) {
    // If no error, then good to proceed.
    console.log("Connected");
});

app.post('/insertEvent', function (req, res) {
    var freqID = req.body.freqID;
    var className = req.body.title;
    //console.log(className);
    var UserID = req.body.UserID;
    var StartDate = req.body.StartDate;
    var EndDate = req.body.EndDate;
    var StartTime = req.body.StartTime;
    var EndTime = req.body.EndTime;
    var query = sqlString.format('exec insertEvent @freqID = ?,@className = ?,@UserID = ?, @StartDate = ?,@Enddate = ?, @startTime = ?,@Endtime = ?', [freqID,className, UserID, StartDate, EndDate, StartTime, EndTime]);
    DB.execInsertStatement(query, connection, res);
})

app.post('/updateEvent', function (req, res) {
    var freqID = req.body.freqID;
    var className = req.body.title;
    var classID = req.body.classID;
    var UserID = req.body.UserID;
    var StartDate = req.body.StartDate;
    var EndDate = req.body.EndDate;
    var StartTime = req.body.StartTime;
    var EndTime = req.body.EndTime;
    var query = sqlString.format('exec updateEvent  @freqID = ?,@className = ?,@UserID = ?, @StartDate = ?,@Enddate = ?, @startTime = ?,@Endtime = ?, @ClassID = ?', [freqID, className,UserID, StartDate, EndDate, StartTime, EndTime,classID]);
    DB.execInsertStatement(query, connection, res);
})

app.get('/calendar', function (req, res) {
    var userID = req.query.userID;
    //var userID = '53FEA2B7-618F-461B-99CF-B51BBC8F29D7'
    var query = sqlString.format('select  * from [vRepeatedSchedules] where UserGUID = cast(? as uniqueidentifier)', [userID]);
    DB.executeStatement(query, connection, res);
});
app.post('/verify', function (req, res) {
    var userName = req.body.userName;
    var password = req.body.password;
    var query = sqlString.format('select * from users where userName = ? and PWDCompare(?,password) = 1', [userName, password]);
    DB.executeStatement(query, connection, res);
});

app.post('/register', function (req, res) {
    var username = req.body.username;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var dob = req.body.DOB;
    var password = req.body.password;
    var query = sqlString.format('insert into users (UserGUID,username,firstname,lastname,dob,password) select newid(), ?,?,?,cast(? as date),PWDENCRYPT(?)', [username, firstname, lastname, dob, password]);
    DB.execInsertStatement(query, connection, res);
});

app.post('/login', function (req, res) {
    var userID = req.body.userID;
    var query = sqlString.format('select * from users where userGUID = ?', [userID]);
    db.once('loggedin', function (msg) {
        if (msg == 1) {
            req.session.userid = userID;
            return res.redirect('/getUsers');
        }
        else {
            req.session.msg = "Invalid login";
            return res.redirect('/');
        }
    });
    db.login(query, connection, res);
});

app.get('/', function (req, res) {
    //changed file to test bc login doesnt work
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/getUsers', function (req, res) {
    if (!req.session.userid) {
        req.session.msg = 'Not allowed there';
        return res.redirect('/');
    }
    else {
        //console.log('main request');
        return res.redirect('/main');
    }

});

app.get('/main', function (req, res) {
    if (!req.session.userid) {
        req.session.msg = 'Not allowed there';
        return res.redirect('/');
    }
    else {
        console.log('send file');
        res.locals.userid = req.session.userid;
        //console.log(res);
        res.sendFile(path.join(__dirname, '/public/main.html'));
    }
});

app.get('/logout', function (req, res) {
    req.session.reset();
    req.session.msg = 'Logged out';
    return res.redirect('/');
});

app.listen(8080, function () {
    console.log('Server Running...');
});
