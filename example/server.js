var rmi = require('../'),
	express = rmi.express,
    app = rmi.app;

app.use(express.static(__dirname + '/web'));

rmi.setImplementation({
    foo: function(){
    	console.log('foo');
        return 'foo';
    }
});

app.listen(process.env.PORT||8081);