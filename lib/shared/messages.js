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

    G.Messages = Messages;
})();