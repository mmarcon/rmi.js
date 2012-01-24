var R = R || {}, path, messages, that, _sProto;

messages = require('../shared/messages').Messages;
path = require('path');

R.Server = function(socket){
    this.socket = socket; //Save for later use
    this.impl = {}; //Stores remote methods implementation
    that = this;
};

_sProto = R.Server.prototype;

_sProto.setSocket = function(socket) {
    this.socket = socket;
};

_sProto.initialize = function(){
    that.socket.on(messages.RMI, function(data){
        that.receiveRemoteCall(data);
    });
};

_sProto.receiveRemoteCall = function(data){
    that.invoke(data);
};

_sProto.invoke = function(remoteCall){
    var fn = that.impl[remoteCall.remoteMethod], rv, reply;
    if (typeof fn === 'function') {
        rv = fn.apply(null, remoteCall.remoteMethodArgs || []);
        reply = that.serialize(remoteCall, rv);
    }
    else {
        rv = messages.RMI_ERROR_NOT_IMPLEMENTED_MSG;
        reply = that.serialize(remoteCall, rv, true);
    }
    that.sendReply(reply);
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
    that.socket.emit(messages.RMI_REPLY, reply);
};

_sProto.doesImplement = function(remoteImpl){
    that.impl = remoteImpl;
};

R.RMIJS_MODULE = {};
R.RMIJS_MODULE.ServerFactory = {
    impl: null,
    forImplementation: function(remoteImpl) {
        this.impl = remoteImpl;
    },
    getHandler: function(socket){
        var rmijsServer = new R.Server(socket);
        rmijsServer.doesImplement(this.impl);
        rmijsServer.initialize();
        return rmijsServer;
    }
};

R.RMIJS_MODULE.handleRoutesFor = function(app) {
    //@TODO: join&minify
    app.get('/rmi-shared/:file', function(req, res) {
        var resPath = path.normalize(__dirname + '/../shared/' + req.params.file);
        res.sendfile(resPath);
    });
    app.get('/client/:file', function(req, res) {
        var resPath = path.normalize(__dirname + '/../client/' + req.params.file);
        res.sendfile(resPath);
    });
};

/*** EXPORT LIST ***/
module.exports = R.RMIJS_MODULE;