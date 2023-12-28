import api from './api/proxy.js';
import tweets from './tweets.js';

//var hash = window.location.hash;

// If a hash exists and corresponds to an element with that ID
//if (hash && document.querySelector(hash)) {
// Scroll to the element with the specified ID
//    document.querySelector(hash).scrollIntoView();
//}

// async function fetchTweets() {
//     const response = await fetch(`${api.settings.server}/mastodon/`);
//     return response.json();
// }
let tweetData = null;
let visibleTweets = 10;
let searchTerm = '';

let sidebar = {
    init: function () {
        document.getElementById('term-search').addEventListener('input', (event) => {
            searchTerm = event.target.value;
            visibleTweets = 10; // Reset visible tweets count
            document.getElementById('tweets').innerHTML = ''; // Clear previous tweets
            sidebar.displayTweets(searchTerm);
        });

        api.init();

        const sidebarElement = document.getElementById('sidebar'); // Replace 'sidebar' with the actual ID or class of your sidebar element

        if (sidebarElement) {
            sidebarElement.addEventListener('scroll', sidebar.handleScroll);
        }

        //tweetData = sidebar.fetchTweets();

        //tweetData = api.getTweets();

        api.getTweets().then(function (data) {
            tweetData = data;
            //tweetData = tweetData.tweets; // Extract the 'tweets' property

            // Check if there's an 'id' query parameter in the URL
            const urlSearchParams = new URLSearchParams(window.location.search);
            const idFromUrl = urlSearchParams.get('t');
            //let idFromUrl = tweets.activeTweet
            //console.log(idFromUrl)

            if (idFromUrl) {
                // Handle the case where the page is loaded with an ID in the URL
                sidebar.displayTweets(idFromUrl);
                const headlineElement = document.getElementById(idFromUrl);
                if (headlineElement) {
                    headlineElement.scrollIntoView({
                        block: 'center',
                        behavior: 'smooth'
                    });
                }
            } else {
                // Default behavior without ID in the URL
                sidebar.displayTweets();
            }
        });
    },

    selectTweet: function (id) {
        visibleTweets = 10; // Reset visible tweets count
        searchTerm = id
        document.getElementById('tweets').innerHTML = ''; // Clear previous tweets
        this.displayTweets(id);
        const headlineElement = document.getElementById(id);
        if (headlineElement) {
            headlineElement.scrollIntoView({
                block: 'center',
                behavior: 'smooth'
            });
        }
    },

    extractHeadTweets: function (tweets) {
        return Object.entries(tweets).filter(([id, tweet]) => !tweet.story || tweet.story === id);
    },

    getTweetsOfStory: function (tweets, storyId) {
        return Object.entries(tweets).filter(([id, tweet]) => tweet.story === storyId && tweet.story !== id);
    },

    createTweetElement: function (id, tweet, isHeadTweet) {    
        const div = document.createElement('div');
        let isActiveTweet = id === tweets.activeTweet;

        div.className = `tweet-container ${isHeadTweet ? '' : 'story-indent'} ${isActiveTweet ? 'active' : ''}`;

        // Use a regular expression to capture the URL and its content
        // const linkMatch = /<a.*?href=["'](.*?)["'].*?>(.*?)<\/a>/g.exec(tweet.content);
        // // If a link is found, extract the URL and text
        // const linkUrl = linkMatch ? linkMatch[1] : '';
        // const linkText = linkMatch ? linkMatch[2] : tweet.content;
        // // Shorten the link text to a length of 100
        // const shortenedLinkText = linkText.length > 100 ? linkText.substring(0, 100) + '...' : linkText;

        // // Create a new link with the shortened text
        // const shortenedLink = `<a href="${linkUrl}" target="_blank" rel="nofollow noopener noreferrer" translate="no">${shortenedLinkText}</a>`;

        // // Replace the original link in the content with the shortened link
        // const contentWithShortenedLink = tweet.content.replace(linkText, "link");
        //<h2 id="${id}">Toot ID: ${id}</h2>
        // ${tweet.hashtags != "" ? `<p>Hashtags:  ${tweet.hashtags.join(', ')}</p>` : ''}
        // ${tweet.story ? `<p>Story ID: ${tweet.story}</p>` : ''}
        div.innerHTML = `
        <div id="${id}" class="message ${isActiveTweet ? 'active' : ''}">
        <div class="tweet-header">
        <div class="tweet-avatar">
            <img src="${tweet.avatar}" alt=":)" id="image-${id}" onerror="this.onerror=null;this.src='../../../static/avatar_icon.png';">
        </div>
        <div class="tweet-username">
        <div class="display-name">${tweet.account ? `${tweet.account}`: 'Anonymous'}</div>
        <div class="account-name">@${tweet.display_name ? `${tweet.display_name}`: 'anon'}</div>
         </div>
        </div>
        
        <div class="tweet-content">
            ${tweet.content ? `${tweet.content}`: '<p>This is a single message. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget risus bibendum, laoreet nisi eget, suscipit massa.</p><p>How do they do it? 🚲</p>'}
        </div>
        
        <div class="message-footnote"><a href = "https://twitter.com/${tweet.display_name}/status/${id}" target="_blank"> @𝕏/Twitter, ${tweet.timestamp ? `${tweet.timestamp}`: '1970-01-01 12:00:00'}</a></div></div>
    `;

        // Add a click event listener to call manager.show(id) when the container is clicked
        div.addEventListener('click', function () {
            tweets.show(id);
        });

        // var originalImage = document.getElementById(`image-${id}`);

        // if (originalImage === null) {
        //     // If the originalImage is null, create a new image element
        //     originalImage = new Image();
        //     originalImage.id = `image-${id}`;
            
        //     // Set the default image source
        //     originalImage.src = '../../../static/avatar_icon.png';
    
        //     // Append the new image element to the tweet-avatar div
        //     var tweetAvatarDiv = document.querySelector('.tweet-avatar');
        //     if (tweetAvatarDiv !== null) {
        //         tweetAvatarDiv.appendChild(originalImage);
        //     } 
        // }

        return div;
    },

    filterTweetsByHashtag: function (tweets, hashtag) {
        const headTweets = sidebar.extractHeadTweets(tweets);
        return headTweets.filter(([id, tweet]) => {
            const storyTweets = sidebar.getTweetsOfStory(tweets, id);
            return (
                tweet.hashtags.map(h => h.toLowerCase()).includes(hashtag.toLowerCase()) ||
                storyTweets.some(([, storyTweet]) => storyTweet.hashtags.map(h => h.toLowerCase()).includes(hashtag.toLowerCase()))
            );
        });
    },

    filterTweetsById: function (tweets, searchId) {
        const headTweets = sidebar.extractHeadTweets(tweets);
        return headTweets.filter(([id, tweet]) => {
            const storyTweets = sidebar.getTweetsOfStory(tweets, id);
            return (
                id.toLowerCase() === searchId.toLowerCase() ||
                storyTweets.some(([storyId, storyTweet]) => storyId.toLowerCase() === searchId.toLowerCase())
            );
        });
    },

    displayTweets: function (searchTerm = '') {
        //document.getElementById('tweets').innerHTML = ''; // Clear previous tweets
        const tweetsContainer = document.getElementById('tweets');
        let filteredTweets;

        if (searchTerm.startsWith('#')) {
            // Hashtag search
            filteredTweets = sidebar.filterTweetsByHashtag(tweetData, searchTerm.slice(1));
            //} else if (searchTerm.startsWith('@')) {
            // Hashtag search
            //filteredTweets = sidebar.filterTweetsByAccount(tweetData, searchTerm.slice(1));
        } else if (searchTerm) {
            // ID search
            filteredTweets = sidebar.filterTweetsById(tweetData, searchTerm);
            //const newUrl = window.location.origin + window.location.pathname + `?id=${encodeURIComponent(searchTerm)}`;
            //window.history.pushState({ path: newUrl }, '', newUrl);
        } else {
            filteredTweets = sidebar.extractHeadTweets(tweetData);
        }

        const tweetsToDisplay = filteredTweets.slice(0, visibleTweets);

        // Only append new tweets instead of clearing and re-rendering all tweets
        const currentTweetCount = tweetsContainer.childElementCount;
        const newTweetsToDisplay = tweetsToDisplay.slice(currentTweetCount);

        newTweetsToDisplay.forEach(([id, tweet]) => {
            tweetsContainer.appendChild(sidebar.createTweetElement(id, tweet, true));
            const storyTweets = sidebar.getTweetsOfStory(tweetData, id);
            storyTweets.forEach(([storyId, storyTweet]) => {
                tweetsContainer.appendChild(sidebar.createTweetElement(storyId, storyTweet, false));
            });
        });

        visibleTweets += 10;
    },

    handleScroll2: async function () {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            sidebar.displayTweets(searchTerm);
        }
    },

    handleScroll: function () {
        const sidebarElement = document.getElementById('sidebar'); // Replace 'sidebar' with the actual ID or class of your sidebar element

        if (sidebarElement) {
            const scrollTop = sidebarElement.scrollTop;
            const scrollHeight = sidebarElement.scrollHeight;
            const clientHeight = sidebarElement.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight-25) {
                // User has reached the bottom of the sidebar
                sidebar.displayTweets(searchTerm);
            }
        }
    },

    clearSearch: function () {
        const searchInput = document.getElementById('term-search');
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
    }
}

export default sidebar
