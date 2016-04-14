'use strict';

const KoaRouter = require('koa-router');
const auth = require('../../lib/auth');

const router = new KoaRouter();

const AUTH_COOKIE_NAME = 'auth_cookie';

// homepage
router.get('login', '/', function *() {
    return yield this.render('login/default');
});

router.post('/login', function *() {
    try {
        const url = this.href;
        const result = yield auth.getAuthorizedRedirectUrl(url);
        this.cookies.set(AUTH_COOKIE_NAME, result.tokenSecret);
        return this.redirect(result.url);
    } catch (e) {
        return this.redirect();
    }
});

router.get('/login', function *() {

    const secret = this.cookies.get(AUTH_COOKIE_NAME);

    if (this.query.oauth_token && this.query.oauth_verifier && secret) {
        const token = yield auth.getAuthorizedToken(
            this.query.oauth_token,
            secret,
            this.query.oauth_verifier
        );
        console.log('YES', token);
    }

    if (secret) {
        this.cookies.set(AUTH_COOKIE_NAME);
    }

    return this.redirect(router.url('login'));
});

module.exports = router;
