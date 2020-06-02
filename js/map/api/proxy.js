import fileTweets from './file.json';
import prepareJavaTweets from './java.js';

let backends = __BACKEND__;

let api = {
    settings: null,
    init: function(backend = backends.default) {
        // console.log(backend)
        api.settings = backends.list[backend];

        switch(api.settings.format) {
            case 'java':
            api.getTweets = function() {
                return $.get(`${api.settings.server}/poi?size=100`).then(function(data) {
                    return prepareJavaTweets(data);
                });
            };
            break;
            case 'python':
                api.getTweets = function() {
                    return $.get(`${api.settings.server}/poi`).then(function(data) {
                        return data.tweets
                    });
                };
            break;
            case 'file':
                api.getTweets = function() {
                    return new Promise((resolve, reject) => {
                        resolve(fileTweets);
                    });
                };
            break;
        }
    },
    getTweets: function() {
        throw 'No backend defined!';
    },
}

export default api
