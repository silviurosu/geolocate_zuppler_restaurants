var x = document.getElementById("demo");

var getLocation = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
var showPosition = function(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    x.innerHTML = "Latitude: " + lat + "; Longitude: " + lng;
    $('#location-message').show();
    searchRestaurants(lat, lng);
}

var searchRestaurants = function(lat, lng) {
  body = {
    query: {
      query: {
        "match_all":{}
      },
      size: 50,
      from: 0,
      filter: {
        "and": [{
          "term":{"state":"published"}
        },{
          "term":{"online_ordering_paused": false}
        },{
          "term":{"channels":"cousinvinnyspizza"}
        }]
      },
      "sort": [{
        "_geo_distance":{
            "position":[lng, lat],
            "order":"asc",
            "unit":"mi"
          }
      }]
    }
  }

  $.ajax({
    url: 'http://api.zuppler.com/v3/channels/zuppler/restaurants/search.json',
    type: 'post',
    data: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    },
    dataType: 'json'
  })
  .done(function(result){
    if (result.success == false) {
      console.log("Error :" + result.error.message);
      return;
    };
    console.log("Found: " + result.restaurants.length + " restaurants");
    if (result.restaurants.length > 0) {
      showRestaurantsList(result.restaurants);
    }
  });
}

var showRestaurantsList = function(restaurants) {
  var restbox = $('#restaurants-box');
  $.each(restaurants, function (index, rest) {
    restbox.append("<li class='list-group-item'>" + rest.name + " -> <em>" + rest.street + '</em> Distance: <span class="label label-primary">' + rest.distance.toFixed(2) + "</span> mi</li>");
  });
}

$( document ).ready(function(){
  getLocation();
})
