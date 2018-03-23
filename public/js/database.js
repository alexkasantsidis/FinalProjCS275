'use strict'

var EventEmitter = require('events').EventEmitter;
var mssql = require('mssql');
var sqlString = require('sqlstring');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var async = require('async');

class Database extends EventEmitter{
	constructor() {super();}
	login(query, connection, res) {
		var self = this;
		var request = new Request(query, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
				return 0;
            }
			else {
                if(rowCount>0) {
					self.emit('loggedin', 1);
				}
				else
					self.emit('loggedin', 0);
            }
		});
		connection.execSql(request);
	}
}
exports.Database = Database