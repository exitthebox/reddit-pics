//display the landing page outside of angular controller. use standard js
function closeLanding(){
  document.getElementById("landingPage").style.visibility = "hidden";
}


angular.module('app', ['bootstrapLightbox'])//inject ngRoute if needed
  // .controller('MainController', ['$scope', 'Lightbox', mainController])
  .controller('MainController', ['$scope', 'Lightbox', 'MainFactory', mainController])
  .factory('MainFactory', ['$http', MainFactory])
  .directive('myOnError', function(){
    return {
      replace: true,
      scope: {
        index: '@'
      },
      link: function(scope, element, attrs) {
        element.bind('error', function() {

                element.context.parentNode.remove()
             
              });
      }
      
    }//return
  })//directive anon function



// inject the service $routeProvider, from ngRoute
// angular.module('app').config(function ($routeProvider) { 
//     $routeProvider.when( '/', {
//         templateUrl: '/landingPage.html'
//     });
//     $routeProvider.when( '/addNew', {
//         templateUrl: '/addNew.html'
//     });
//     $routeProvider.when( '/about', {
//         templateUrl: '/views/about.html',
//         controller : 'aboutCtrl',
//     });
    
//     // the default route
//     $routeProvider
//       .otherwise({
//         redirectTo: '/about'
//       });
//   })

angular.module('app').config(function (LightboxProvider) {
  // set a custom template
  LightboxProvider.templateUrl = 'myLightbox.html';
});




function mainController($scope, Lightbox, MainFactory){
  // var mc = this
  
  $scope.showCaption = true
  // $scope.radiovalue = 1

  $scope.ss = 'EarthPorn'

  MainFactory.getRedditImages($scope.ss, 'new', function(cbPhotos){
    // console.log("cbPhotos: ", cbPhotos)
    $scope.photosArray = cbPhotos
    $scope.$apply()//re-render the page
    // console.log("$scope.photosArray: ", $scope.photosArray)
  })

  // console.log("testVar1: ", testVar)
  // console.log("testVar2: ", testVar.urlCaptionsArray)
  // console.log("")
  
  $scope.selectASub = function (){
    console.log('$scope.ss: ', $scope.ss)
    MainFactory.getRedditImages($scope.ss, 'new', function(cbPhotos){
      $scope.photosArray = cbPhotos
      $scope.$apply()//re-render the page
      })
  }
  

 

 

  $scope.openLightboxModal = function (index) {
    console.log('openLightboxModal()', $scope.photosArray.indexOf(index))
      Lightbox.openModal($scope.photosArray, index)
  }

  $scope.remove = function(item) { 
        // console.log('remove()', $scope.photosArray.indexOf(item))

    var index = $scope.photosArray.indexOf(item)
    $scope.photosArray.splice(index, 1)
    // $scope.photosArray[index].$destroy
    // console.log('$scope.photosArray[index]: ', $scope.photosArray[index])

  }

  $scope.addToWall = function(url, caption){
    console.log('addToWall()', url, caption)
    var urlObj = {'url': url, 'caption': caption}

    $scope.photosArray.unshift(urlObj)

    $scope.newURL = null
    $scope.newCaption = null

  }

  $scope.radiovalue = 'new'

  $scope.radioClick = function(value){
    // console.log("radioClick(): ", value)
    // $scope.photosArray = [] 
    MainFactory.getRedditImages($scope.ss, value, function(cbPhotos){
      $scope.photosArray = cbPhotos
      $scope.$apply()//re-render the page
    })
  }


//mainController()
}

function MainFactory($http){

  

return{

  getRedditImages: function(selectedSubReddit,redditListType, cb){
    var urlCaptionsArray = []
    //library for accessing reddit api 7/27/2016
    var Snoocore = window.Snoocore;
    var reddit = new Snoocore(
      {/* config options */

      // Unique string identifying the app
      userAgent: '/u/exitthebox refactoruPics@0.0.0',
      // It's possible to adjust throttle less than 1 request per second.
      // Snoocore will honor rate limits if reached.
      throttle: 300,
      oauth: {
        type: 'implicit',
        key: '-mpFYh7K38M1rQ',
        redirectUri: 'http://localhost:8080',
        // The OAuth scopes that we need to make the calls that we
        // want. The reddit documentation will specify which scope
        // is needed for evey call
        scope: [ 'read', 'vote' ]
      }
    })
    var subRedditListType = redditListType
    var subReddit = selectedSubReddit
    // function newep(){
    //   subRedditListType = 'new'
    // }
    // console.log('new Snoocore: ')
    console.log('endpoint: ' +'/r/'+selectedSubReddit+'/'+subRedditListType)

    reddit('/r/'+selectedSubReddit+'/'+subRedditListType).get({
      limit: 15 //todo: add angular expression so users can set this value
    }).then(function(){
        // console.log(arguments[0].data.children)
        var listingArray = arguments[0].data.children || []

        for(i=1;i<listingArray.length;i++){
          var childrenData = listingArray[i].data || []
          // console.log('childrenData ', childrenData)
          var urlData = childrenData.url || {}
          // console.log('urlData before ', urlData) 
          urlData = urlData.replace(/&amp;/g, '&')//fixes reddit bug for 'unauthorized'
          // console.log('urlData after ', urlData)

          var captionData = listingArray[i].data.title || {}
          // console.log('captionData', captionData)
          //build the objects for the array with url and caption
          // console.log("url: ", listingArray[i].data.url, "caption: ", listingArray[i].data.title)
          var urlCaptionObject = {'url' : urlData, 'caption' : captionData}
          // console.log('urlCaptionObject: ', urlCaptionObject)
          urlCaptionsArray.push(urlCaptionObject) 


        }//for loop


        cb(urlCaptionsArray)

        // console.log("urlCaptionsArray: ", urlCaptionsArray)

      })  //.then function

    return {

      urlCaptionsArray: urlCaptionsArray
    }
  }

} //return

}

  //http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  // function guid() {
  //   function s4() {
  //     return Math.floor((1 + Math.random()) * 0x10000)
  //       .toString(16)
  //       .substring(1);
  //   }
  //   // console.log('uuid: ', s4() + s4() + '-' + s4() + '-' + s4() + '-' +
  //   //   s4() + '-' + s4() + s4() + s4())

  //   return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
  //     s4() + '-' + s4() + s4() + s4();
  // }

  

console.log('app.js loaded')