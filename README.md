# RMI.js

Think of Java Remote Method Invocation (RMI) in the JavaScript world.

**RMI.js** is a combination of some JavaScript client-side code and a Node.js module that enables seemless invocation of remote methods. Developers can define objects with methods that are either local, remote or both and invoke them on the client. The framework will know whether the implementation is stored locally or on the server and take the necessary actions to provide a return value.

**RMI.js** takes advantage of Socket.io for exchanging data between client and server.

## Use RMI.js
With this latest release (**0.1.1**) I added the dependendecies directly to the `package.json` file, therefore a

    npm install rmi.js
    
should be enough to have the all thing up and running.

On your HTML files you need to include both socket.io as well as rmi.js:

    <script src="/socket.io/socket.io.js"><!-- socket.io --></script>
	<!--
	    the following line
	    ensures all the RMI.js
	    client-side code concatenated
	    and minified is delievered to the client
	-->
	<script src="/rmi.js"></script>

On the server side you can do something like this:

    var rmi = require('rmi.js'),
    	express = rmi.express, //exposes express object
        app = rmi.app; //exposes express app object
    
    app.use(express.static(__dirname + '/web')); //You could, for instance, use Express
                                                 //to serve your static pages
    
    //Set the remote implementation of the JS methods that are exposed on the client side
    rmi.setImplementation({
        foo: function(){
        	console.log('foo');
            return 'foo';
        }
    });
    
    //Finally tell express to listen on port 8081
    app.listen(8081);



## Building RMI.js yourself from the source

You can use GNU make after you made any change:

    mmarcon@wallace:~/personal/rmi.js$ make
    
the Makefile requires an existing installation of node.js to run correctly. Additionally it depends on uglify.js, so before building do make sure you do
    
    npm install uglify-js

The building process concatenates and minifies all the code that is served to the client in a single compressed JS file.

## Example
There is also a very basic example of how to use the all thing, client and server side. To run it just download the source code, cd into the module root directory and do

    make example
    
## Additional Information
The project's website goes down very often: Nodester is a great project but they update the infrastructure quite a lot, and I always forget to check wether the app needs to be restarted. If you are looking for additional information on **RMI.js** you can take a look at this blog post: [http://blog.marcon.me/post/18720214029/remote-method-invocation](http://blog.marcon.me/post/18720214029/remote-method-invocation).