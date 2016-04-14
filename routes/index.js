/**
 * @author David Menger
 */
'use strict';

// create a router instance
const KoaRouter = require('koa-router');
const login = require('./login');

const router = new KoaRouter();

// for '/' path
router.use(login.routes(), login.allowedMethods());

module.exports = router;
