//Defines the list of js files that are expected to
//be minified and appended together.
exports.__CLIENT__ = {
    minDest: 'rmijs.c.min.js',
    dest: 'rmijs.c.js',
    payload: [
        '../shared/messages',   //Dep0
        '../shared/utilities',  //Dep1
        'rmijs.client'          //Target
    ]
};