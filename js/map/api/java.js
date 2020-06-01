export default function (data) {

    console.log('RECODE JAVA BACKEND OUTPUT')
    console.log(data)

    let finalArray = [];
    let ltweets = [];


    function receiveData(data) {
        ltweets = data._embedded.poi.filter(filterData).map(mapToInternalStructure);
        return getTweetArray(createDataTree(ltweets));
    }

    function filterData(item) {
        return !!item.expandedUrl;
    }

    function mapToInternalStructure(item) {
      let tweetId = item.tweetId

      let sp_hash = item.expandedUrl.indexOf('/@') + 2;
      let ep_hash = item.expandedUrl.indexOf('/',sp_hash);

      //get zoomLevel
      let sp_z = item.expandedUrl.indexOf('/z=') + 3;
      let ep_z = item.expandedUrl.indexOf('/',sp_z);

      //get layers
      let sp_ls = item.expandedUrl.indexOf('/ls=') + 4;
      let ep_ls = item.expandedUrl.length;

      return { 'tweetId': tweetId,
                    '@': item.expandedUrl.substring(sp_hash,ep_hash),
                    'z': item.expandedUrl.substring(sp_z,ep_z),
                    'parentTweetId': item.inReplyToTweetId,
                    'type': item.type,
                    'replyFromSameUser': item.replyFromSameUser,
                    'ls': item.expandedUrl.substring(sp_ls,ep_ls).split(",")}
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
    // getTweetArray = function(data){
    //   data.forEach((item, i) => {
    //       let nameEntry = data[i].tweetId
    //       finalArray[nameEntry] =  [];
    //       flattenTrees(data[i],
    //           function(node){ // do what you like with each node
    //               finalArray[nameEntry].push(node);
    //           }
    //       );
    //   });
    // }


    return {
        "1264134811934961664": {
            "hashtags": [],
            "url": "/@u2838fkfw/z=11/ls=light,no2_2020_03,power-plants,tweets"
        },
        "1264135178450096134": {
            "hashtags": [
                "thisisatest"
            ],
            "story": "1264135178450096134",
            "url": "/@u0y13ckzz/z=10/ls=light,power-plants"
        },
        "1264836376966713346": {
            "hashtags": [
                "buildingathread"
            ],
            "story": "1264135178450096134",
            "url": "/@ezjqncs7z/z=10/ls=satellite,e-prtr,e-prtr2,power-plants,big-cities,tweets"
        }
    }
};
