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
    Messages.RMI         = 'rmi';
    Messages.RMI_REPLY   = 'rmi_reply';
    Messages.RMI_PUSH    = 'rmi_push';
    Messages.RMI_ERROR   = 'rmi_error';
    
    Messages.RMI_ERROR_NOT_IMPLEMENTED_MSG = 'Method Not Implemented';

    G.Messages = Messages;
}());