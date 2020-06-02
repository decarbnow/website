export default function (data) {

    console.log('RECODE JAVA BACKEND OUTPUT')
    console.log(data)


    let ltweets = [];


    function receiveData(data) {
        ltweets = data._embedded.poi.filter(filterData).map(mapToInternalStructure);

        let tweetArray = getTweetArray(createDataTree(ltweets))
        let finalArray = [];
        for (var i in tweetArray) {
            for (var j in tweetArray[i]) {
                let name = tweetArray[i][j].tweetId
                finalArray[name] = {
                    'hashtags': tweetArray[i][j].hashtags,
                    'story': i,
                    'url': tweetArray[i][j].url
                }
            }
        }
        return(finalArray)

    }

    function filterData(item) {
        return !!item.expandedUrl;
    }

    function mapToInternalStructure(item) {
      return { 'tweetId': item.tweetId,
                'url': item.expandedUrl,
                'hashtags': item.type,
                'parentTweetId': item.inReplyToTweetId,
                'replyFromSameUser': item.replyFromSameUser}
    };

    const createDataTree = dataset => {
        let hashTable = Object.create(null)
        dataset.forEach( aData => hashTable[aData.tweetId] = { ...aData, childNodes : [] } )
        let dataTree = []
        dataset.forEach( aData => {
            if( aData.parentTweetId && hashTable[aData.parentTweetId] && aData.replyFromSameUser) hashTable[aData.parentTweetId].childNodes.push(hashTable[aData.tweetId])
            else dataTree.push(hashTable[aData.tweetId])
        } )

        return dataTree
    }

    let flattenTrees = function(node, fn){ // sends values of tree to fn in pre-order
        fn(node); //call at preorder
        if(node.childNodes.length > 0){
            node.childNodes.forEach(function(e){
                flattenTrees(e,fn);
            });
        }
    }

    //GET ARRAY
    let getTweetArray = function(data){
      let finalArray = [];
      data.forEach((item, i) => {
          let nameEntry = data[i].tweetId
          finalArray[nameEntry] =  [];
          flattenTrees(data[i],
              function(node){ // do what you like with each node
                  finalArray[nameEntry].push(node);
              }
          );
      });
      return(finalArray);
    }

    return(receiveData(data))

    // return {
    //     "1264134811934961664": {
    //         "hashtags": [],
    //         "url": "/@u2838fkfw/z=11/ls=light,no2_2020_03,power-plants,tweets"
    //     },
    //     "1264135178450096134": {
    //         "hashtags": [
    //             "thisisatest"
    //         ],
    //         "story": "1264135178450096134",
    //         "url": "/@u0y13ckzz/z=10/ls=light,power-plants"
    //     },
    //     "1264836376966713346": {
    //         "hashtags": [
    //             "buildingathread"
    //         ],
    //         "story": "1264135178450096134",
    //         "url": "/@ezjqncs7z/z=10/ls=satellite,e-prtr,e-prtr2,power-plants,big-cities,tweets"
    //     }
    // }
};
