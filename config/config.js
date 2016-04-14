'use strict';

module.exports = {

    oauth: {
        requestTokenUrl: 'https://trello.com/1/OAuthGetRequestToken',
        authUrl: 'https://trello.com/1/OAuthAuthorizeToken',
        accessTokenUrl: 'https://trello.com/1/OAuthGetAccessToken',
        key: '334b6b58198f9b58bb08fd15e0a43716',
        secret: '846d4d6bfb7b5f2b08c818d1de16ea344deb744ee384d096255c2f00f2ec2836',
        name: 'My App Name'
    },

    db: {
        url: 'mongodb://localhost:27017/trello'
    }
};
