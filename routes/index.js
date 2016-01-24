/**
 * @author David Menger
 */
'use strict';

// create a router instance
const KoaRouter = require('koa-router');

const router = new KoaRouter();

// homepage
router.get('/', function *() {
    // render index.hbs template
    yield this.render('index');
});

module.exports = router;
