var cabApp = angular.module('cabApp', ['ngRoute', 'ngResource']);
var placeSearch, sourceAuto, destAuto;
var uberClientId = 'T9j2Lj1dnihJUA9P58gLVaDkDFQb-rqD'
    , uberServerToken = 'naAqhVrDKbYU6O5ytfA5VjDXOAZf4iaJTRy1ok81';
// ROUTES
cabApp.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/search.html'
        , controller: 'searchController'
    }).when('/result', {
        templateUrl: 'partials/result.html'
        , controller: 'resultController'
    });
});
// SERVICES
cabApp.service('locationService', function () {
    this.splace = '';
    this.dplace = '';
    this.initMap = function () {
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 7
            , center: {
                lat: 41.85
                , lng: -87.65
            }
        });
        directionsDisplay.setMap(map);
    };
    this.calculateAndDisplayRoute = function (directionsService, directionsDisplay) {
        directionsService.route({
            origin: document.getElementById('start').value
            , destination: document.getElementById('end').value
            , travelMode: 'DRIVING'
        }, function (response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
            }
            else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    };
});
// CONTROLLERS
cabApp.controller('searchController', ['$scope', '$http', 'locationService', function ($scope, $http, locationService) {
    $scope.splace = locationService.splace;
    $scope.$watch('splace', function () {
        locationService.splace = $scope.splace;
    });
    $scope.dplace = locationService.dplace;
    $scope.$watch('dplace', function () {
        locationService.dplace = $scope.dplace;
    });
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7
        , center: {
            lat: 41.85
            , lng: -87.65
        }
    });
    $scope.initAuto = function () {
        // Create the autocomplete object, restricting the search to geographical
        // location types.
        sourceAuto = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */
            (document.getElementById('source')), {
                types: ['geocode']
            });
        destAuto = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */
            (document.getElementById('dest')), {
                types: ['geocode']
            });
        // When the user selects an address from the dropdown, populate the address
        // fields in the form.
        sourceAuto.addListener('place_changed', function () {
            var place = sourceAuto.getPlace();
            if (!place.geometry) {
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                window.alert("No details available for input: '" + place.name + "'");
                return;
            }
            //Assign value to service var
            $scope.$apply(function () {
                $scope.splace = place;
            });
            //console.log($scope.splace.geometry.location.lat());
            //console.log($scope.splace.geometry.location.lng());
        });
        destAuto.addListener('place_changed', function () {
            var place = destAuto.getPlace();
            if (!place.geometry) {
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                window.alert("No details available for input: '" + place.name + "'");
                return;
            }
            $scope.$apply(function () {
                $scope.dplace = place;
            });
            //console.log($scope.dplace.geometry.location.lat());
            //console.log($scope.dplace.geometry.location.lng());
        });
    };
    //locationService.initMap();
    $scope.initAuto();
}]);
cabApp.controller('resultController', ['$scope', '$http', '$resource', 'locationService', function ($scope, $http, $resource, locationService) {
    console.log('Uber');
    console.log(locationService.splace.geometry.location.lat());
    console.log(locationService.splace.geometry.location.lng());
    console.log(locationService.dplace.geometry.location.lat());
    console.log(locationService.dplace.geometry.location.lng());
    var slat = locationService.splace.geometry.location.lat();
    var slng = locationService.splace.geometry.location.lng();
    var dlat = locationService.dplace.geometry.location.lat();
    var dlng = locationService.dplace.geometry.location.lng();
    $scope.getEstimates = function () {
        //Uber API req
        $http({
            method: 'GET'
            , url: 'https://api.uber.com/v1/estimates/price'
            , headers: {
                'Authorization': 'Token ' + uberServerToken
            }
            , params: {
                start_latitude: slat
                , start_longitude: slng
                , end_latitude: dlat
                , end_longitude: dlng
            }
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            console.log(response);
        }, function errorCallback(response) {
            console.log(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
        var token = "J_YbQUi4c5cq:YR6T71_hfUpQi8TM0p93iuP2z9bwVh8S";
        $http({
            method: 'POST'
            , url: 'https://api.lyft.com/oauth/token'
            , headers: {
                'Content-Type': 'application/json'
                , 'Authorization': 'Basic ' + btoa(token)
            }
            , data: {
                grant_type: "client_credentials"
                , scope: "public"
            }
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            console.log('Lyft' + response.data.access_token);
            $http({
                method: 'GET'
                , url: 'https://api.lyft.com/v1/cost'
                , headers: {
                    'Content-Type': 'application/json'
                    , 'Authorization': 'Bearer ' + response.data.access_token
                }
                , params: {
                    start_lat: slat
                    , start_lng: slng
                    , end_lat: dlat
                    , end_lng: dlng
                }
            }).then(function successCallback(response) {
                console.log(response);
            }, function errorCallback(response) {});
            //$http.defaults.headers.common.Authorization = 'Bearer ' + response.data.access_token;
            //$cookies.put("access_token", data.data.access_token);
            //window.location.href = "index";
        }, function errorCallback(response) {
            console.log('Lyft' + response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    /*$scope.lyftdata = {
            grant_type: "client_credentials",
            scope: "public"
        };
    console.log($scope.lyftdata);
        $scope.getLyft = function () {
            var req = {
                method: 'POST',
                url: "https://api.lyft.com/oauth/token",
                headers: {
                    'Content-type': "application/json"
                },
                data: $httpParamSerializer($scope.lyftdata)
            };
            $http(req).then(function (data) {
                $scope.access_token = data.data.access_token;
                console.log(data.data.access_token);
                //$cookies.put("access_token", data.data.access_token);
                //window.location.href = "index";
            });
        };*/
    // $scope.getLyft();
    $scope.getEstimates();
}]);
// GOOGLE AUTOCOMPLETE
// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var geolocation = {
                lat: position.coords.latitude
                , lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
                center: geolocation
                , radius: position.coords.accuracy
            });
            sourceAuto.setBounds(circle.getBounds());
        });
    }
}
//GOOGLE MAP INTEGRATION
function initMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7
        , center: {
            lat: 41.85
            , lng: -87.65
        }
    });
    directionsDisplay.setMap(map);
    /*var onChangeHandler = function() {
      calculateAndDisplayRoute(directionsService, directionsDisplay);
    };
    document.getElementById('start').addEventListener('change', onChangeHandler);
    document.getElementById('end').addEventListener('change', onChangeHandler);*/
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: document.getElementById('start').value
        , destination: document.getElementById('end').value
        , travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        }
        else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}