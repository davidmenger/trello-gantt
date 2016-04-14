'use strict';

const oauth = require('oauth');

class OauthOne {

    /**
     * Creates an instance of OauthOne.
     *
     * @param {{
     *    requestTokenUrl: string,
     *    accessTokenUrl: string,
     *    authUrl: string,
     *    key: string,
     *    secret: string
     * }} config
     */
    constructor (config) {

        /**
         * @type {{
         *    requestTokenUrl: string,
         *    accessTokenUrl: string,
         *    authUrl: string,
         *    key: string,
         *    secret: string
         * }}
         */
        this._config = config;

        /**
         * @type {oauth.OAuth}
         */
        this._oauth = null;
    }

    /**
     * (description)
     *
     * @returns {oauth.OAuth} (description)
     */
    _getOauth () {
        if (this._oauth === null) {
            this._oauth = new oauth.OAuth(
                this._config.requestTokenUrl,
                this._config.accessTokenUrl,
                this._config.key,
                this._config.secret,
                '1.0A',
                null,
                'HMAC-SHA1'
            );
        }
        return this._oauth;
    }

    /**
     * (description)
     *
     * @param {string} oauthCallbackUrl
     * @returns {Promise.<{url:string, token: string, tokenSecret: string}, Error>} Promise
     */
    getAuthorizedRedirectUrl (oauthCallbackUrl) {

        return new Promise((resolve, reject) => {
            this._getOauth().getOAuthRequestToken({
                oauth_callback: oauthCallbackUrl
            }, (err, token, tokenSecret) => {
                if (err) {
                    reject(err);
                } else {
                    const name = encodeURIComponent(this._config.name);
                    const url = `${this._config.authUrl}?oauth_token=${token}&name=${name}`;
                    resolve({
                        url,
                        token,
                        tokenSecret
                    });
                }
            });
        });
    }

    /**
     * (description)
     *
     * @param {string} oauthToken (description)
     * @param {string} oauthTokenSecret (description)
     * @param {string} oauthVerifier (description)
     * @returns {Promise.<{accessToken: string, accessTokenSecret: string}, Error>} (description)
     */
    getAuthorizedToken (oauthToken, oauthTokenSecret, oauthVerifier) {

        return new Promise((resolve, reject) => {
            this._getOauth().getOAuthAccessToken(oauthToken, oauthTokenSecret, oauthVerifier,
                (err, accessToken, accessTokenSecret) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            accessToken,
                            accessTokenSecret
                        });
                    }
                });
        });
    }
}

module.exports = OauthOne;
