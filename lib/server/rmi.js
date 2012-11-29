var R = R || {},
    path,
    http,
    messages,
    messageHelper,
    io,
    express,
    _sProto,
    DEFAULT_PUSH_THRESHOLD = -1,

messages = require('../shared/messages').Messages;
messageHelper = messages.MessageHelper;
path = require('path');
http = require('http');
io = require('socket.io');
express = require('express');

R.Server = function(socket){
    this.socket = socket; //Save for later use
    this.impl = {}; //Stores remote methods implementation
    this.invocationCounter = {}; //Counts function invocations
    this.pushThreshold = DEFAULT_PUSH_THRESHOLD; //Never push
};

_sProto = R.Server.prototype;

_sProto.setSocket = function(socket) {
    this.socket = socket;
};

_sProto.setPushThreshold = function(invocationCount) {
    this.pushThreshold = invocationCount;
};

_sProto.initialize = function(){
    var self = this;
    this.socket.on(messages.RMI, function(data){
        self.receiveRemoteCall(data);
    });
};

_sProto.receiveRemoteCall = function(data){
    //console.log('Received bytes from the client', Buffer.byteLength(JSON.stringify(messageHelper.m2o(data))));
    data = messageHelper.m2o(data);
    this.invoke(data);
};

_sProto.incrementCounterFor = function(counter) {
    var c = this.invocationCounter[counter];
    if (!!c && typeof c === 'number') {
        this.invocationCounter[counter] = c + 1;
    }
    else {
        this.invocationCounter[counter] = 1;
    }
};

_sProto.checkNeedsPush = function(fnName) {
    var c = this.invocationCounter[fnName], self = this, pushMessage;
    if (this.pushThreshold === -1) {
        return;
    }
    if (!!c && typeof c === 'number' && c > this.pushThreshold) {
        pushMessage = {
            type: messages.RMI_PUSH,
            fn: self.impl [fnName].toString(),
            fnName: fnName
        };
        this.pushMethod(pushMessage);
    }
};

_sProto.invoke = function(remoteCall){
    var fn = this.impl[remoteCall.remoteMethod], rv, reply;
    if (typeof fn === 'function') {
        this.incrementCounterFor (remoteCall.remoteMethod);
        rv = fn.apply(null, remoteCall.remoteMethodArgs || []);
        reply = this.serialize(remoteCall, rv);
    }
    else {
        rv = messages.RMI_ERROR_NOT_IMPLEMENTED_MSG;
        reply = this.serialize(remoteCall, rv, true);
    }
    this.sendReply(reply);
    this.checkNeedsPush (remoteCall.remoteMethod);
};

_sProto.serialize = function(remoteCall, returnValue, error){
    var reply = {
        invocationId: remoteCall.invocationId,
        type: !!error ? messages.RMI_ERROR : messages.RMI_REPLY,
        result: returnValue
    };
    return reply;
};

_sProto.sendReply = function(reply){
    //console.log('Sending bytes to the client', Buffer.byteLength(JSON.stringify(messageHelper.o2m(reply))));
    this.socket.emit(messages.RMI_REPLY, messageHelper.o2m(reply));
};

_sProto.pushMethod = function(serializedMethod){
    //console.log('Sending bytes to the client', Buffer.byteLength(JSON.stringify(messageHelper.o2m(serializedMethod))));
    this.socket.emit(messages.RMI_PUSH, messageHelper.o2m(serializedMethod));
};

_sProto.doesImplement = function(remoteImpl){
    this.impl = remoteImpl;
};

R.RMIJS_MODULE = {};
R.RMIJS_MODULE.ServerFactory = {
    impl: null,
    forImplementation: function(remoteImpl){
        this.impl = remoteImpl;
    },
    getHandler: function(socket){
        var rmijsServer = new R.Server(socket);
        rmijsServer.doesImplement(this.impl);
        rmijsServer.initialize();
        return rmijsServer;
    }
};

R.RMIJS_MODULE.handleRoutesFor = function(app){
    //@Deprecated route
    app.get('/rmi-shared/:file', function(req, res) {
        var resPath = path.normalize(__dirname + '/../shared/' + req.params.file);
        res.sendfile(resPath);
    });
    //@Deprecated route
    app.get('/client/:file', function(req, res) {
        var resPath = path.normalize(__dirname + '/../client/' + req.params.file);
        res.sendfile(resPath);
    });
    //Delivers all the client side code joined and minified
    app.get('/rmi.js', function(req, res) {
        var resPath = path.normalize(__dirname + '/../client/rmijs.c.min.js');
        res.sendfile(resPath);
    });
};

R.RMIJS_MODULE.listen = function(app, enableLogging){
    var server = http.createServer(app),
        listener = io.listen(server);
    if (!enableLogging) {
        listener.set('log level', 0);
    }
    R.RMIJS_MODULE.handleRoutesFor(app);
    listener.sockets.on('connection', function(socket) {
        R.RMIJS_MODULE.ServerFactory.getHandler(socket);
    });
    app.listen = function() {
        server.listen.apply(server, arguments);
    };
    return app;
};

R.RMIJS_MODULE.setImplementation = function(impl){
    R.RMIJS_MODULE.ServerFactory.forImplementation(impl);
};

/*** EXPOSE Socket.io ***/
R.RMIJS_MODULE.io = io;
R.RMIJS_MODULE.express = express;
R.RMIJS_MODULE.app = R.RMIJS_MODULE.listen(express());

/*** EXPORT LIST ***/
module.exports = R.RMIJS_MODULE;