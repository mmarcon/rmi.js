var SHARED = require('../lib/shared/shared.js').__SHARED__;
//var uglify = require('uglify-js');
var fs = require('fs');

var location;

var result={};
location = '../lib/shared/'
SHARED.payload.forEach(function(file){
    var path = location + file + '.js'
    fs.readFile (path, function(err, content) {
        if (err){
            console.log(err);
            process.exit(1);
        }        
        result [file] = content;
        if (Object.keys(result).length !== SHARED.payload.length) return;
        
        var code;
        SHARED.payload.forEach(function(file) {
            code += '\n' + result [file];
        });
        console.log(code);
    });
});