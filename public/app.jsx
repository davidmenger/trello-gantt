'use strict';

const React = require('react');
const ReactDom = require('react-dom');

class App extends React.Component {
    render () {
        return <h2>Hello world</h2>;
    }
}

ReactDom.render(<App />, document.getElementById('app'));

module.exports = App;
