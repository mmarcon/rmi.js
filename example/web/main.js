;
(function(){
    var STUB = {
        foo: function(){} //noop
    };
    STUB.foo.remote = true;
    RMIJS.Client(STUB).setEndpoint('http://localhost:8081');

    STUB.foo().then(function(){console.log(arguments)});
}());