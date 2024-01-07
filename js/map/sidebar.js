import api from './api/proxy.js';
import tweets from './tweets.js';
import 'zoom-vanilla.js'

let tweetData = null;
let visibleTweets = 10;
let searchTerm = '';
let history = [];
let scrollPosition = 0;
let lastScrollPosition = 0;
let lastVisibleTweets = 0;
let addVisibleTweets = 5;

let currentPage = 1;

const tweetsPerPage = 10;

document.getElementById('next-button').addEventListener('click', function () {
    currentPage++;
    sidebar.displayTweets(searchTerm, currentPage);
    let sidebarElement = document.getElementById('sidebar');
    if (sidebarElement) {
        sidebarElement.scrollTop = 0;
    }
});

document.getElementById('prev-button').addEventListener('click', function () {
    if (currentPage > 1) {
        currentPage--;
        sidebar.displayTweets(searchTerm, currentPage);
    }
    let sidebarElement = document.getElementById('sidebar');
    if (sidebarElement) {
        sidebarElement.scrollTop = 0;
    }
});

document.getElementById('back-button').addEventListener('click', function () {
    sidebar.back()
});


document.getElementById('term-search').addEventListener('input', (event) => {
    searchTerm = event.target.value;
    //visibleTweets = createTweetElement; // Reset visible tweets count
    document.getElementById('tweets').innerHTML = ''; // Clear previous tweets
    sidebar.displayTweets(searchTerm);
});



let sidebar = {
    init: function () {
        api.init();

        let class_bb = document.querySelector('.back-btn')
        class_bb.classList.add('hidden')

        api.getTweets().then(function (data) {
            tweetData = data;
            //tweetData = tweetData.tweets; // Extract the 'tweets' property

            // Check if there's an 'id' query parameter in the URL
            const urlSearchParams = new URLSearchParams(window.location.search);
            const idFromUrl = urlSearchParams.get('t');
            //let idFromUrl = tweets.activeTweet

            if (idFromUrl) {
                // Handle the case where the page is loaded with an ID in the URL
                sidebar.displayTweets(idFromUrl);
                const headlineElement = document.getElementById(idFromUrl);
                if (headlineElement) {
                    headlineElement.scrollIntoView({
                        block: 'center',
                        behavior: 'auto'
                    });
                }
            } else {
                // Default behavior without ID in the URL
                sidebar.displayTweets();
            }
        });
    },

    scrollToHeadTweet: function (id, delay = 0) {
        const lastElement = document.getElementById(sidebar.getHeadTweetById(id, tweetData));
        const loadingMessage = document.getElementById('loading-message');

        if (loadingMessage) {
            loadingMessage.style.display = 'block';
        }

        if (lastElement) {
            setTimeout(function () {
                lastElement.scrollIntoView({
                    block: 'start',
                    behavior: 'instant'
                });
                if (loadingMessage) {
                    loadingMessage.style.display = 'none';
                }
            }, delay); // Delay might be needed to wait for tweets to load
        } else {
            const sidebarElement = document.getElementById('sidebar'); // Replace 'sidebar' with the actual ID or class of your sidebar element
            if (sidebarElement) {
                sidebarElement.scrollTop = 0;
            }
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        }
    },

    selectTweet: function (id) {

        let class_mw = document.querySelector('.migration')
        class_mw.classList.add('hidden')

        history.push(id); // Add this line
        //console.log(history)
        let class_bb = document.querySelector('.back-btn');
        class_bb.classList.remove('hidden');

        sidebar.hideID('prev-button')
        sidebar.hideID('next-button')

        lastScrollPosition = scrollPosition; // Save the scroll position before clearing the tweets
        scrollPosition = 0; // Reset the scroll position
        if (lastVisibleTweets == 0) {
            lastVisibleTweets = visibleTweets; // Save visible tweets count
        }

        visibleTweets = 10; // Reset visible tweets count
        searchTerm = id
        document.getElementById('tweets').innerHTML = '';
        this.displayTweets(id);
        const headlineElement = document.getElementById(id);

        if (headlineElement) {

            let tweetHeight = headlineElement.getBoundingClientRect().height;
            let sidebarHeight = document.getElementById('sidebar').clientHeight;
            // Determine block property depending on tweet's height
            const blockProp = tweetHeight > sidebarHeight ? 'start' : 'center';

            headlineElement.scrollIntoView({
                block: blockProp,
                behavior: 'smooth'
            });
        }
    },

    extractHeadTweets: function (tweets) {
        return Object.entries(tweets).filter(([id, tweet]) => !tweet.story || tweet.story === id);
    },

    extractAllTweets: function (tweets) {
        return Object.entries(tweets);
    },

    getTweetsOfStory: function (tweets, storyId) {
        return Object.entries(tweets).filter(([id, tweet]) => tweet.story === storyId && tweet.story !== id);
    },

    createTweetElement: function (id, tweet, isHeadTweet) {

        function formatTweetContent(tweet) {
            // Regular expression to match hashtags
            const hashtagRegex = /#([^\s!"#$%&'()*+,-./:;<=>?@[\\\]^`{|}~]+)/g


            // Regular expression to match URLs
            const urlRegex = /(https?:\/\/[^\s()]+)/g;

            // Regular expression to match user accounts
            const userRegex = /@([^\s!"#$%&'()*+,-./:;<=>?@[\\\]^`{|}~]+)/g

            // Replace hashtags with colored version
            const coloredContent = tweet.content.replace(hashtagRegex, '<span class="hashtag">#$1</span>');

            // Replace URLs with clickable links
            const urlClickableContent = coloredContent.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');

            // Replace user accounts with colored version
            const finalContent = urlClickableContent.replace(userRegex, '<span class="account">@$1</span>');

            // Set the formatted content back to the tweet object
            tweet.formattedContent = finalContent;
        }

        function getMediaHTML(media, galleryId) {
            // Check if media is an array of strings
            const imageWidth = 100 / media.length; // Calculate the width based on the number of images

            if (Array.isArray(media) && media.length > 0 && typeof media[0] === 'string') {
                // Generate HTML for a single string URL
                const mediaHTML = media.map((item, index) => `
                <div id="media-${id}" style="max-width: 100%; padding: 1px;">
                    <img src="${media[index]}" data-action="zoom"  alt="Zoom ${galleryId}">
                </div>
                `
                ).join('');
                return mediaHTML;
            }
            //style="width: 100%; height: auto; image-rendering: high-quality;"
            // Generate HTML for each media item in the array of objects
            const mediaHTML = media.map((item, index) => `
                    <img src="${item.media_url_https}"  data-action="zoom" alt="Zoom ${galleryId}" style="width=auto;height=auto; ">
                `
            ).join('');

            return mediaHTML;
        }

        const div = document.createElement('div');
        let isActiveTweet = id === tweets.activeTweet;

        div.className = `tweet-container ${isHeadTweet ? 'story-head' : 'story-indent'} ${isActiveTweet ? 'active' : ''}`;

        if (tweet.content != null) {
            formatTweetContent(tweet)
        }
        if (tweet.display_name == "decarbnow") {
            tweet.avatar = "https://pbs.twimg.com/profile_images/1661680048456310787/GAUbAfaq_200x200.jpg"
        }

        if (tweet.display_name == "ExposePolluters") {
            tweet.avater = "https://pbs.twimg.com/profile_images/1727839247653089281/9XVjm12k_200x200.jpg"
        }

        if (tweet.display_name == "PolluterRod") {
            tweet.avater = "https://pbs.twimg.com/profile_images/1366487335232299014/nn2P7XYz_200x200.jpg"
        }

        div.innerHTML = `
            <div class="message-container">
                <div id="${id}" class="message ${isActiveTweet ? 'active' : ''}">
                    <div class="tweet-header">
                        <div class="tweet-avatar ${isHeadTweet ? '' : 'story'}">
                            <img src="${tweet.avatar}" id="image-${id}" onerror="this.onerror=null;this.src='https://map.decarbnow.space/static/avatar_icon.png';">
                        </div>
                        <div class="tweet-username">
                            <div class="display-name">${tweet.account ? `${tweet.account}` : 'Anonymous'}</div>
                            <div class="account-name">@${tweet.display_name ? `${tweet.display_name}` : 'anon'}</div>
                        </div>
                    </div>

                    <div class="tweet-content">
                        ${tweet.content ? `${tweet.formattedContent}` : '<p>This is a single message. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget risus bibendum, laoreet nisi eget, suscipit massa.</p><p>How do they do it? 🚲</p>'}
                    </div>
                    
                    ${tweet.media && tweet.media.length > 0 ? `
                        <div class="tweet-media">
                            <div id="gallery-${id}" style="display: flex;">
                                ${getMediaHTML(tweet.media, id)}
                            </div>
                        </div>
                    ` : ''}

                    <div class="message-footnote"><a href="https://twitter.com/${tweet.display_name}/status/${id}" target="_blank"> @𝕏/Twitter, ${tweet.timestamp ? `${tweet.timestamp}` : '1970-01-01 12:00:00'}</a></div>
                </div>
            </div>
        `;

        if (!isActiveTweet) {
            // Add a click event listener to call manager.show(id) when the container is clicked
            div.addEventListener('click', function () {
                tweets.show(id);
            });
        }

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

    getHeadTweetById: function (id, tweets) {
        // Convert the tweets object to an array and iterate over it 
        for (const [tweetId, tweet] of Object.entries(tweets)) {

            // Check if the id is equal to the current tweet id 
            if (id === tweetId) {

                // Check if it's a head tweet
                if (!tweet.story || tweet.story === id) {
                    return id; // return the head tweet
                    // If it's not a head tweet, find the head tweet 
                } else if (tweets[tweet.story]) {
                    return tweet.story; // returns the head of the tweet with the specified ID
                }
            }
        }

        return null; // Return null if no head tweet was found
    },

    showID: function (id) {
        let element = document.getElementById(id);
        element.style.display = "inline";   // Hides the element
    },

    hideID: function (id) {
        let element = document.getElementById(id);
        element.style.display = "none";   // Hides the element
    },

    displayTweets: function (searchTerm = '', page = 1) {
        const tweetsContainer = document.getElementById('tweets');
        let filteredTweets;

        if (searchTerm.startsWith('#')) {
            // Hashtag search
            filteredTweets = sidebar.filterTweetsByHashtag(tweetData, searchTerm.slice(1));
        } else if (searchTerm) {
            // ID search
            filteredTweets = sidebar.filterTweetsById(tweetData, searchTerm);
        } else {
            filteredTweets = sidebar.extractHeadTweets(tweetData);
        }

        let class_nb = document.querySelectorAll('.navigation-button')
        class_nb.forEach(button => button.classList.remove('hidden'));

        const startIndex = (page - 1) * tweetsPerPage;

        const tweetsToDisplay = filteredTweets.slice(startIndex, startIndex + tweetsPerPage);

        if (page === 1) {
            sidebar.hideID('prev-button')
        } else {
            sidebar.showID('prev-button')
        }


        if (tweetsToDisplay.length < tweetsPerPage) {
            // If there are no more tweets on the next page, hide the "next" button
            sidebar.hideID('next-button')
        } else {
            sidebar.showID('next-button')
        }


        // Clear previous tweets only if it's the first page
        tweetsContainer.innerHTML = '';

        // Append new tweets instead of clearing and re-rendering all tweets
        tweetsToDisplay.forEach(([id, tweet]) => {
            //console.log(id)
            //tweets.visibleMarker(id)
            tweetsContainer.appendChild(sidebar.createTweetElement(id, tweet, true));
            const storyTweets = sidebar.getTweetsOfStory(tweetData, id);
            storyTweets.forEach(([storyId, storyTweet]) => {
                tweetsContainer.appendChild(sidebar.createTweetElement(storyId, storyTweet, false));
            });
        });
    },

    back: function (goToTweet = true) {
        tweets.closeSidebar();
        if(!goToTweet)
            currentPage = 1

        base.tweetBoxActive = false;

        visibleTweets = lastVisibleTweets; // Restore visible tweets count

        document.getElementById('tweets').innerHTML = ''; // Clear current tweets
        sidebar.displayTweets(searchTerm, currentPage);

        let currentZoom = base.map.getZoom(); // Get current zoom level
        if (currentZoom > 7)
            base.map.setZoom(currentZoom - 3); // Reduce the zoom level by 2

        lastVisibleTweets = 0

        //document.getElementById('sidebar').scrollTop = 0;

        // if (sidebarElement) {
        //     setTimeout(function () {
        //         sidebarElement.scrollTop = lastScrollPosition;
        //         lastVisibleTweets = 0
        //     }, 1000); // Delay might be needed to wait for tweets to load
        // }

        if (goToTweet) {
            let lastId = history[history.length - 1]; // Get last id
            sidebar.scrollToHeadTweet(lastId, 500)
        } else {
            let sidebarElement = document.getElementById('sidebar');
            if (sidebarElement) {
                sidebarElement.scrollTop = 0;
            }
        }

        let class_mw = document.querySelector('.migration')
        class_mw.classList.remove('hidden')
    },

    handleScroll: function () {
        const sidebarElement = document.getElementById('sidebar');

        if (sidebarElement) {
            const scrollTop = sidebarElement.scrollTop;
            const scrollHeight = sidebarElement.scrollHeight;
            const clientHeight = sidebarElement.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 100) {
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
