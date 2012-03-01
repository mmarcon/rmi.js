# RMI.js

Think of Java Remote Method Invocation (RMI) in the JavaScript world.

**RMI.js** is a combination of some JavaScript client-side code and a Node.js module that enables seemless invocation of remote methods. Developers can define objects with methods that are either local, remote or both and invoke them on the client. The framework will know whether the implementation is stored locally or on the server and take the necessary actions to provide a return value.

**RMI.js** takes advantage of Socket.io for exchanging data between client and server.

## Building and using RMI.js
I am making some changes and some refactoring to **RMI.js**, until I am done the way to build it is with GNU make:

    mmarcon@wallace:~/personal/rmi.js$ make
    
the Makefile requires an existing installation of node.js to run correctly. Additionally it depends on uglify.js, so before building do make sure you do
    
    npm install uglify-js

The building process concatenates and minifies all the code that is served to the clien in a single compressed JS file. Therefore if you use the most recent version of **RMI.js** the only inclusions that are required in your HTML file are:

    <script src="/socket.io/socket.io.js"><!-- socket.io --></script>
	<!--
	    the following line
	    ensures all the RMI.js
	    client-side code concatenated
	    and minified is delievered to the client
	-->
	<script src="/rmi.js"></script>
	
Socket.io and Express are still dependencies that have to be installed manually, I am working on getting rid of that step.