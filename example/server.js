var express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    rmi = require('rmi.js');
io.set('log level', 0);
app.use(express.static(__dirname + '/web'));

rmi.handleRoutesFor(app);

rmi.ServerFactory.forImplementation({
    foo: function(){
    	console.log('foo');
        return 'foo';
    }
});

app.listen(8081);

//And listen for socket.io events
io.sockets.on('connection', function(socket) {
    rmi.ServerFactory.getHandler(socket);
});