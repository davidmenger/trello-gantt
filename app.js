'use strict';

const Koa = require('koa');
const path = require('path');
const koaHbs = require('koa-hbs');
const koaStaticCache = require('koa-static-cache');

const config = require('./config');

// initialize configuration
config.initialize(process.env.NODE_ENV);

const db = require('./lib/db');

const routes = require('./routes');
const app = new Koa();

// set up view engine
const viewPath = path.join(__dirname, 'views');
const layoutsPath = path.join(viewPath, 'layouts');

// attach templating engine
app.use(koaHbs.middleware({
    defaultLayout: 'default',
    layoutsPath,
    viewPath,
    extname: '.hbs'
}));

// let's override our error handler
app.use(function *(next) {
    try {
        yield next;
    } catch (err) {
        this.res.status = err.code || 500;
        yield this.render('error');
        this.app.emit('error', err, this);
    }
});

// mount a main router
app.use(routes.routes());

const publicPath = path.join(__dirname, 'public');

if (false && config.debugEnabled) {
    const koaWebpackDev = require('koa-webpack-dev');
    const webpackConfig = require('./webpack.config');

    Object.assign(webpackConfig, {
        devtool: 'source-map'// 'eval-cheap-module-source-map'
    });

    app.use(koaWebpackDev({
        config: webpackConfig,
        webRoot: publicPath
    }));
}

app.use(koaStaticCache(publicPath, {
    buffer: !config.debugEnabled,
    dynamic: config.debugEnabled,
    filter: (file) => file.match(/^(?!lib|less|components)/),
    // use compression
    gzip: true,
    usePrecompiledGzip: true
}));

// handle 404 - not found
app.use(function *() {
    this.res.status = 404;

    console.log('404: ', this.req.url);
    yield this.render('notFound', {
        url: this.req.url
    });
});

// just log errors
app.on('error', (err, ctx) => {
    console.log('server error', err, ctx);
});

module.exports = app;
