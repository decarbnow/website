import fileTweets from './file.json';
import prepareJavaTweets from './java.js';


window.recodeJavaBackend = function() {
    return $.get('https://decarbnow.space/api/poi?size=100').then(function(data) {
        let pd = prepareJavaTweets(data);
        console.log('GOT:')
        console.log(pd)
    });
};

let api = {
    settings: null,
    init: function(settings) {
        api.settings = settings;

        switch(api.settings.format) {
            case 'java':
            api.getTweets = function() {
                return $.get(`${api.settings.server}/poi`).then(function(data) {
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
