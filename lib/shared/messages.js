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