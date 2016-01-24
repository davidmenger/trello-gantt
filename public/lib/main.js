'use strict';

require('../less/default.less');
require('../app.jsx');

const test = 1;
const x = `${test}`;

setTimeout(() => {
    console.log(x);
}, 20);
