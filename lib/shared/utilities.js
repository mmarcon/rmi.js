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