# RMI.js

Think of Java Remote Method Invocation (RMI) in the JavaScript world.

**RMI.js** is a combination of some JavaScript client-side code and a Node.js module that enables seemless invocation of remote methods. Developers can define objects with methods that are either local, remote or both and invoke them on the client. The framework will know whether the implementation is stored locally or on the server and take the necessary actions to provide a return value.

**RMI.js** takes advantage of Socket.io for exchanging data between client and server.