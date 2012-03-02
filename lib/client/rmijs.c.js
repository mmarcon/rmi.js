(function(){
    var G, Messages = {};
    //Temporary solution for the global object problem:
    //if we are in node consider global the module
    if (typeof module !== 'undefined' && module.exports) {
        G = exports;
    }
    //if we are in the browser then window is the global object
    else {
        G = window.RMIJS = window.RMIJS || {};
    }
    //@TODO: find a better solution for sharing code
    Messages.RMI         = 0;
    Messages.RMI_REPLY   = 1;
    Messages.RMI_PUSH    = 2;
    Messages.RMI_ERROR   = 3;
    
    Messages.RMI_ERROR_NOT_IMPLEMENTED_MSG = 'Method Not Implemented';

    Messages.MessageHelper = {};
    Messages.MessageHelper.o2m = function (object){
        var result = [];
        switch(object.type){
            case Messages.RMI:
                //Then we have something like this:
                //{type: <T>, remoteMethod: <M>, remoteMethodArgs: <[]>, invocationId: <ID>}
                result [0] = Messages.RMI;
                result [1] = object.invocationId;
                result [2] = object.remoteMethod;
                result [3] = object.remoteMethodArgs; //Array
                break;
            case Messages.RMI_REPLY:
            case Messages.RMI_ERROR:
                //Then the format is
                //{type: <T>, result: <R|E>, invocationId: <ID>}
                //Where R is the Result
                //and E is the error message if an error occurred
                result [0] = object.type;
                result [1] = object.invocationId;
                result [2] = object.result;
                break;
            case Messages.RMI_PUSH:
                result [0] = Messages.RMI_PUSH;
                result [1] = object.fn;
                result [2] = object.fnName;
        }
        return result;
    };
    Messages.MessageHelper.m2o = function (array){
        var object = {};
        switch (array[0]){
            case Messages.RMI:
                object.type             = Messages.RMI;
                object.invocationId     = array [1];
                object.remoteMethod     = array [2];
                object.remoteMethodArgs = array [3];
                break;
            case Messages.RMI_REPLY:
            case Messages.RMI_ERROR:
                object.type         = array [0];
                object.invocationId = array [1];
                object.result       = array [2];
                break;
            case Messages.RMI_PUSH:
                object.type   = array [0];
                object.fn     = array [1];
                object.fnName = array [2];
        }
        return object;
    };

    G.Messages = Messages;
})();
(function(){
    var G, U;
    //Temporary solution for the global object problem:
    //if we are in node consider global the module
    if (typeof module !== 'undefined' && module.exports) {
        G = exports;
    }
    //if we are in the browser then window is the global object
    else {
        G = window.RMIJS = window.RMIJS || {};
    }
    //@TODO: find a better solution for sharing code

    U = G.Utilities = {};
    
    //A stopwatch. May result useful for adding some reasoning
    U.StopWatch = function(){
        if (!(this instanceof U.StopWatch)) {
            return new U.StopWatch();
        }
        this.start = 0;
        this.stop = 0;
    };
    U.StopWatch.prototype.start = function(){
        this.start = new Date().getTime();
    };
    U.StopWatch.prototype.stop = function(){
        this.stop = new Date().getTime();
    };
    U.StopWatch.prototype.reset = function(){
        this.start = 0;
        this.stop = 0;
    };
    U.StopWatch.prototype.getTimeInMilliseconds = function(){
        return this.stop - this.start;
    };
    U.StopWatch.prototype.getTimeInSeconds = function(){
        return this.getTimeInMilliseconds() / 1000;
    };
    
    //Shared logging function
    U.LOG = function(){}; //Logging disable
    
    
    //Random ID generator: generates a random alphanumeric string
    //with the specified lenght. The default lenght is 12.
    U.random = function(length) {
        var rs, i, nextIndex, l, chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
                 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2',
                 '3', '4', '5', '6', '7', '8', '9', '0'];
        l = (length) ? length : 12;
        rs = '';
        for (i = 0; i < l; i++) {
            nextIndex = Math.floor(Math.random() * chars.length);
            rs += chars [nextIndex];
        }
        return rs;
    };
    
})();
(function(window){
    //@TODO: deferred objects are alternatives to callbacks
    var R = window.RMIJS = window.RMIJS || {},
        LOG = R.Utilities.LOG || function(){console.log(arguments);},
        C = {},
        that,
        _cProto,
        _pProto,
        _isFn,
        _getClosure,
        _getRandomId,
        _throw,
        _webSocket,
        _onReturnValueReceived,
        _onPushReceived,
        _onEndpointConnected,
        _stopWatch,
        _messageHelper;

    /*** CONSTANTS ***/
    C.RMI = R.Messages.RMI;
    C.RMI_REPLY = R.Messages.RMI_REPLY;
    C.RMI_PUSH = R.Messages.RMI_PUSH;
    C.RMI_ERROR = R.Messages.RMI_ERROR;
    C.RMI_EP_CONNECTED = R.Messages.RMI_EP_CONNECTED;
    C.FAIL_SILENTLY = true;

    /*** PRIVATE ***/
    _isFn = function(fn) {
        return typeof fn === 'function';
    };

    _getRandomId = R.Utilities.random;
    _messageHelper = R.Messages.MessageHelper;

    _getClosure = function(fnName) {
        return function(){
            var args = Array.prototype.splice.call(arguments, 0);
            args.unshift(fnName); //arguments[0] will be the method name
            return _cProto._invokeRemote.apply(that, args);
        };
    };

    _throw = function(message) {
        if (!that.failSilently) {
            throw new Error(message);
        }
    };

    _onReturnValueReceived = function(data) {
        data = _messageHelper.m2o(data);
        LOG(data);
        that._receiveAndNotifyListener(data);
    };

    _onEndpointConnected = function() {
        _webSocket._epConnected = true;
    };

    _onPushReceived =  function(data) {
        data = _messageHelper.m2o(data);
        LOG('Function ' + data.fnName + ' pushed from endpoint.');
        var f;
        eval("f=" + data.fn);
        if (_isFn(f)) {
            that._pushToLocal(data.fnName, f);
        }
    };

    _stopWatch = R.Utilities.StopWatch();

    /*** END PRIVATE ***/

    /*** RMIJS.Promise ***/
    R.Promise = function(id){
        this.id = id;
        this.result = null;
        this.error = null;
        this.thenSuccess = null;
        this.thenError = null;
        //@TODO: implement when queue
    };
    _pProto = R.Promise.prototype;
    _pProto.then = function(onSuccess, onError){
        var onSuccessSet = _isFn(onSuccess),
            onErrorSet = _isFn(onError);
        if (onSuccessSet) {
            this.thenSuccess = onSuccess;
        }
        if (onErrorSet) {
            this.thenError = onError;
        }
    };
    _pProto.resolve = function(result){
        var self = this;
        self.result = result;
        if (_isFn(self.thenSuccess)) {
            self.thenSuccess.apply(self, [result, self]);
        }
    };
    _pProto.reject = function(error){
        var self = this;
        self.error = error;
        if (_isFn(self.thenError)) {
            self.thenError.apply(self, [error, self]);
        }
    };

    /*** END RMIJS.Promise ***/

    /*** RMIJS.Client ***/
    R.Client = function(stub){
        if (!(this instanceof R.Client)) {
            return new R.Client(stub); //we don't really wanna use new every time!
        }
        that = this;
        that.callbackRegistry = {};
        that.promiseRegistry = {};
        that.endpoint = null;
        that.initWithStub(stub);
        that.failSilently = C.FAIL_SILENTLY;
        that.localStub = stub;
    };
    _cProto = R.Client.prototype;

    _cProto.setEndpoint = function(endpoint, andConnect) {
        that.endpoint = endpoint;
        if (andConnect || andConnect === undefined) {
            that._connect();
        }
    };

    _cProto.initWithStub = function(stub) {
        //Go through the stub, and for methods marked as remote
        //let's try to add some smart logic...
        var methodName, method;
        for (methodName in stub) {
            if (stub.hasOwnProperty(methodName)) {
                method = stub[methodName];
                if (_isFn(method) && method.remote === true) {
                    stub[methodName] = _getClosure(methodName);
                }
            }
        }
    };

    _cProto._connect = function() {
        if (!!that.endpoint) {
            _webSocket = io.connect(that.endpoint);
            //_webSocket.on(C.RMI_EP_CONNECTED, _onEndpointConnected);
            _webSocket.on(C.RMI_REPLY, _onReturnValueReceived);
            _webSocket.on(C.RMI_PUSH, _onPushReceived);
        }
        else {
            _throw("Can't connect without endpoint. Hint: use setEndpoint first.");
        }
    };

    _cProto._invokeRemote = function() {
        var argsArray = Array.prototype.slice.call(arguments, 0),
            remoteMethod, remoteMethodArgs, originalCallback, invocationId, serializedRemoteCall, promise;

        remoteMethod = argsArray.shift();
        originalCallback = argsArray.pop();
        remoteMethodArgs = argsArray;
        invocationId = _getRandomId();
        if (!_isFn(originalCallback)) {
            remoteMethodArgs.unshift(originalCallback);
            originalCallback = null;
        }
        else {
            that._registerCallback(invocationId, originalCallback);
        }
        promise = new R.Promise(invocationId);
        that._registerPromise(invocationId, promise);
        serializedRemoteCall = that._serialize(remoteMethod, remoteMethodArgs, invocationId);
        LOG('Invoking, ', serializedRemoteCall);
        that._doInvokeRemote(serializedRemoteCall);
        return promise;
    };

    _cProto._registerCallback = function(invocationId, callbackFn) {
        that.callbackRegistry [invocationId] = callbackFn;
    };

    _cProto._registerPromise = function(invocationId, promise) {
        that.promiseRegistry [invocationId] = promise;
    };

    _cProto._receiveAndNotifyListener = function(remoteReturnValue) {
        var invocationId = remoteReturnValue.invocationId,
            callback = that.callbackRegistry [invocationId],
            promise = that.promiseRegistry [invocationId];
        if (promise instanceof R.Promise) {
            if (remoteReturnValue.type === C.RMI_ERROR) {
                promise.reject(remoteReturnValue.result);
            }
            else {
                promise.resolve(remoteReturnValue.result);
            }
            promise = null;
        }
        if (_isFn(callback) && remoteReturnValue.type !== C.RMI_ERROR) {
            callback (remoteReturnValue.result);
        }
        //We don't need the callback anymore, cleanup
        delete that.callbackRegistry [invocationId];
    };

    _cProto._doInvokeRemote = function(serializedRemoteInvocation) {
        if (_webSocket) {
            _webSocket.emit(serializedRemoteInvocation.type, data = _messageHelper.o2m(serializedRemoteInvocation));
        }
        else {
            _throw("Endpoint connection was not set or failed.");
        }
    };

    _cProto._serialize = function(remoteMethod, remoteMethodArgs, invocationId) {
        var invocationObject = {
            type: C.RMI,
            remoteMethod: remoteMethod,
            remoteMethodArgs: remoteMethodArgs,
            invocationId: invocationId
        };
        return invocationObject;
    };

    _cProto._pushToLocal = function(fnName, fn){
        that.localStub [fnName] = fn;
    };

    R.version = '0.1.0';
})(this);