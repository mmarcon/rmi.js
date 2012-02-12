var CLIENT = require('../lib/client/client.js').__CLIENT__,
    jsp = require("uglify-js").parser,
    pro = require("uglify-js").uglify,
    fs = require('fs'),
    location, result = {};

console.log('-- Merging and minifying client code...');
location = '../lib/client/';
CLIENT.payload.forEach(function(file){
    var path = location + file + '.js'
    fs.readFile(path, function(err, content) {
        if (err){
            console.log(err);
            process.exit(1);
        }
        result [file] = content;
        if (Object.keys(result).length !== CLIENT.payload.length) return;
        
        var code = '', stats;
        CLIENT.payload.forEach(function(file) {
            code += ((code) ? '\n' : '') + result [file];
        });
        fs.writeSync(fs.openSync(location + CLIENT.dest, 'w'), code, 0, 'utf8'); //Write the non-minified version
        stats = fs.statSync(location + CLIENT.dest);
        console.log('-- DONE with unminified version [' + location + CLIENT.dest + ' (' + stats.size + ' Bytes - ' + (stats.size/1024).toFixed(2) + ' KB)]');
        
        var ast = jsp.parse(code);
        ast = pro.ast_mangle(ast);
        ast = pro.ast_squeeze(ast);

        code = pro.gen_code(ast);
        fs.writeSync(fs.openSync(location + CLIENT.minDest, 'w'), code, 0, 'utf8'); //Write the minified version
        stats = fs.statSync(location + CLIENT.minDest);
        console.log('-- DONE with minified version [' + location + CLIENT.minDest + ' (' + stats.size + ' Bytes - ' + (stats.size/1024).toFixed(2) + ' KB)]');
    });
});