var Request = require('tedious').Request;
function DBRequest() { }

DBRequest.prototype.executeStatement = function (query, connection,res) {
    var jsonArray = []
    var request = new Request(query, function (err, rowCount, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rowCount + ' rows returned');

        }
    });
    // it just needs some manipulating
    request.on('row', function (columns) {

        var rowObject = new Object;
        columns.forEach(function (column) {
            rowObject[column.metadata.colName] = column.value;
        });
        jsonArray.push(rowObject)
    });
    request.on('doneProc', function (rowCount, more, rows) {
        //do something with JSONArray

        //return code here

        console.log(jsonArray);
        res.send(jsonArray);
    });
    connection.execSql(request);
}
DBRequest.prototype.execInsertStatement = function (query, connection, res) {
    //var jsonArray = []
    var request = new Request(query, function (err, rowCount, rows) {
        if (err) {
            console.log(err);
        } else {
            //console.log(rowCount + ' rows returned');
            console.log('inserted')
        }
    });
    // it just needs some manipulating
  
    request.on('doneProc', function (rowCount, more, rows) {
        //do something with JSONArray

        //return code here

        //console.log(jsonArray);
        res.send('inserted');
    });
    connection.execSql(request);
}

module.exports = DBRequest;