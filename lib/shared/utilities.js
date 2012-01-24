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
    U.LOG = function(){}; //Logging disable
}());