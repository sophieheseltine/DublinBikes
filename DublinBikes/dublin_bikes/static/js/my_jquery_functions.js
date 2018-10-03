//Displays modal, weather, map, station details when page is loaded
$(document).ready(function() {
	$('#myModal').modal('show');
	displayWeather()
	displayMap()
	populateFindStationDropdown('StationIName')
	populateJourneyPlannerDropdown('start')
	populateJourneyPlannerDropdown('end')
    populateHourDropdown()
    populateDayDropdown()
    populatePredictionStationDropdown('predictionStation')
	document.getElementById("weather").style.textTransform = "capitalize";
});

//Displays occupancy based on bikes available
$(document).on("click", "#bikes", function() {
	$('#myModal').modal('hide');
	displayMarkers();
    showBikeLegend();
});

//Displays occupancy on stands available
$(document).on("click", "#stands", function() {
	$('#myModal').modal('hide');
	changeMarkers();
    showStandLegend();
});

//Populates the dropdown list to Search stations using ID value
function populateFindStationDropdown(StationName) {
	var html_code = '';
	$.getJSON("stations", function(StationListName) {
		var stationList = StationListName;
		var option = document.getElementById('StationIName');
		var j = 0;
		for (var i = 0; i < stationList.length; i++) {
			j++;
			option[j] = new Option(stationList[i].StationIName, stationList[i].Station_ID);
		}
	});
};

//Populates the station dropdown list for prediction model using ID value
function populatePredictionStationDropdown(StationName) {
	var html_code = '';
	$.getJSON("stations", function(StationListName) {
		var stationList = StationListName;
		var option = document.getElementById('predictionStation');
		var j = 0;
		for (var i = 0; i < stationList.length; i++) {
			j++;
			option[j] = new Option(stationList[i].StationIName, stationList[i].Station_ID);
		}
	});
};

//Populates the day dropdown list for prediction model using weekday/weekend value
function populateDayDropdown() {
        var d = new Date();
        var n = d.getDay();
        var date = d.getDate();
        var i = n;
		var option = document.getElementById('day'),
        days = ['Monday', 'Tuesday', 'Wednesday','Thursday','Friday','Saturday','Sunday']
        var j = 1;
        while (j <= 5){
            option[j] = new Option(days[i-1]+" "+ date, days[i-1]+ " "+date++)
            if (i > 6){
                i -=6;
            }
            else{
                i++
            }
            j++
        }
		}

//Populates the hour dropdown list for prediction model using hour value
function populateHourDropdown() {
		var option = document.getElementById('time');
		var j = 1;
    for (i=0; i<25; i++){
        option[j] = new Option(i, i)
        j++
    } 
		}

//Populate the dropdown list to Plan a Journey using coordinate value
function populateJourneyPlannerDropdown(StationAddress) {
	var html_code = '';
	$.getJSON("stations", function(StationListName) {
		var stationList = StationListName;
		var option = document.getElementById(StationAddress);
		var j = 0;
		for (var i = 0; i < stationList.length; i++) {
			j++;
			var coord = [stationList[i].Latitude, stationList[i].Longitude]
			option[j] = new Option(stationList[i].StationIName, coord);
		}
	});
};

//When Station in 'Select a Station' dropdown is selected the displayRealTimeInfo and displayforecast functions are called
$(document).ready(function() {
	$("#stationDropdown").change(function() {
		displayRealTimeInfo();
		displayForecast();
        displayWarning();
        showBikeLegend();
	});
});

//Displays a simple map of dublin with no markers
function displayMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 53.3498053,
			lng: -6.260309699999993
		},
		zoom: 13})                   
};
var map;

//Displays a stand legend to assist user in navigating map
function showBikeLegend(){
            var baseIcons = {
          bikes: {
            name: 'More Bikes',
            icon: '..//static/images/marker_green.png'
          },
          stands: {
            name: 'More Stands',
            icon: '..//static/images/marker_red.png'
          },
          equal: {
            name: 'Similar Amount of Bikes to Stands',
            icon: '..//static/images/marker_orange.png'
          }                        
	}
        var keys = "<b>Map Legend: </b>";
        var i = 0;
        for (key in baseIcons) {
            var type = baseIcons[key];
            var name = type.name;
            var icon = type.icon;
            keys += '<img src="' + icon + '"> ' + name;
            i++}
         document.getElementById('legend').innerHTML = keys
    
        }

//Displays a stand legend to assist user in navigating map
function showStandLegend(){
            var baseIcons = {
          bikes: {
            name: 'More Stands',
            icon: '..//static/images/marker_green.png'
          },
          stands: {
            name: 'More Bikes',
            icon: '..//static/images/marker_red.png'
          },
          equal: {
            name: 'Similar Amount of Bikes to Stands',
            icon: '..//static/images/marker_orange.png'
          }                        
	}
        var keys = "<b>Map Legend: </b>";
        var i = 0;
        for (key in baseIcons) {
            var type = baseIcons[key];
            var name = type.name;
            var icon = type.icon;
            keys += '<img src="' + icon + '"> ' + name;
            i++}
         document.getElementById('legend').innerHTML = keys
    
        }

//Displays a legend to assist user in navigating the nearby stations map
function showLocationLegend(){
            var baseIcons = {
          bikes: {
            name: 'More Stands',
            icon: '..//static/images/marker_green.png'
          },
          stands: {
            name: 'More Bikes',
            icon: '..//static/images/marker_red.png'
          },
          equal: {
            name: 'Similar Amount of Bikes to Stands',
            icon: '..//static/images/marker_orange.png'
          },
        current:{
                name: 'Current Location',
                icon:'..//static/images/marker_blue.png'
            }
	}
        var keys = "<b>Map Legend: </b>";
        var i = 0;
        for (key in baseIcons) {
            var type = baseIcons[key];
            console.log(baseIcons[i])
            var name = type.name;
            var icon = type.icon;
            keys += '<img src="' + icon + '"> ' + name;
            i++}
         document.getElementById('legend').innerHTML = keys
    
        }

//Displays markers on the map focusing on available bikes
function displayMarkers() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 53.3498053,
			lng: -6.260309699999993
		},
		zoom: 13,
	});
	var infoWindow = new google.maps.InfoWindow()
	$.getJSON("stations", function(StationData) {
		$.getJSON("stationDetails", function(stationData) {
			var DynamicDetails = stationData;
			var stationDetails = StationData;
			$.each(stationDetails, function(station) {
				var v_icon = '';
                var total = DynamicDetails[station].bike_stands;
				var bikes = DynamicDetails[station].available_bikes;
				var stands = DynamicDetails[station].available_bike_stands;
                var max = total*0.7;
                var min = total*0.3
				if (bikes > max) {
					v_icon = '..//static/images/marker_green.png';
				} else if (bikes < min) {
					v_icon = '..//static/images/marker_red.png'
				} else{
					v_icon = '..//static/images/marker_orange.png';
				}
				var marker = new google.maps.Marker({
					position: {
						lat: parseFloat(stationDetails[station].Latitude),
						lng: parseFloat(stationDetails[station].Longitude)
					},
					map: map,
					title: stationDetails[station].StationIName,
					station_number: stationDetails[station].Station_ID,
					icon: v_icon
				});
				marker.metadata = {
					type: "point",
					title: stationDetails[station].StationIName
				};
				google.maps.event.addListener(marker, 'click', (function(marker, stationDetails) {
					return function() {
						var content = "" + DynamicDetails[station].name + ": " + DynamicDetails[station].last_update+ "<br>&emsp;&emsp;&emsp;Bikes: " + DynamicDetails[station].available_bikes + "&emsp; &emsp; &emsp;Stands: " + DynamicDetails[station].available_bike_stands;
						infoWindow.setContent(content)
						infoWindow.open(map, marker);
					}
				})(marker, stationDetails));
				marker.addListener('click', function() {
					map.setZoom(16);
					map.setCenter(marker.getPosition());
				});
				marker.addListener('dblclick', function() {
					map.setZoom(13);
					map.setCenter({
						lat: 53.3498053,
						lng: -6.260309699999993
					});
				});
			})
		});
	});
}

//Displays markers on the map focusing on available stands
function changeMarkers() {
		map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 53.3498053,
			lng: -6.260309699999993
		},
		zoom: 13,
	});
	var infoWindow = new google.maps.InfoWindow()
	$.getJSON("stations", function(StationData) {
		$.getJSON("stationDetails", function(stationData) {
			var DynamicDetails = stationData;
			var stationDetails = StationData;
			$.each(stationDetails, function(station) {
				var v_icon = '';
			    var total = DynamicDetails[station].bike_stands;
				var bikes = DynamicDetails[station].available_bikes;
				var stands = DynamicDetails[station].available_bike_stands;
                var max = total*0.7;
                var min = total*0.3;
				if (stands > max) {
					v_icon = '..//static/images/marker_green.png';
				} else if (stands < min) {
					v_icon = '..//static/images/marker_red.png'
				} else {
					v_icon = '..//static/images/marker_orange.png';
				}
				var marker = new google.maps.Marker({
					position: {
						lat: parseFloat(stationDetails[station].Latitude),
						lng: parseFloat(stationDetails[station].Longitude)
					},
					map: map,
					title: stationDetails[station].StationIName,
					station_number: stationDetails[station].Station_ID,
					icon: v_icon
				});
				marker.metadata = {
					type: "point",
					title: stationDetails[station].StationIName
				};
				google.maps.event.addListener(marker, 'click', (function(marker, stationDetails) {
					return function() {
						var content = "" + DynamicDetails[station].name + ": " + DynamicDetails[station].last_update + "<br>&emsp; &emsp; &emsp;Stands: " + DynamicDetails[station].available_bike_stands + "&emsp;&emsp;&emsp;Bikes: " + DynamicDetails[station].available_bikes;
						infoWindow.setContent(content)
						infoWindow.open(map, marker);
					}
				})(marker, stationDetails));
				marker.addListener('click', function() {
					map.setZoom(16);
					map.setCenter(marker.getPosition());
				});
				marker.addListener('dblclick', function() {
					map.setZoom(13);
					map.setCenter({
						lat: 53.3498053,
						lng: -6.260309699999993
					});
				});
			})
		});
	});
}

//Display Current weather
function displayWeather() {
	$.getJSON("weather", null, function(data) {
		var deetdays = data;
		var descrip = deetdays[0].description;
		var temp = deetdays[0].temp;
		var icon2 = deetdays[0].icon;
		var weather = "Current Weather: " + descrip + "<img src='http://openweathermap.org/img/w/" + icon2 + ".png'/>" + temp + "&#8451</p>";
		document.getElementById("weather").innerHTML = weather;
	});
};

//Display station markers and real time information for occupancy
function displayRealTimeInfo() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 53.3498053,
			lng: -6.260309699999993
		},
		zoom: 13,
	});
	var dropdown = document.getElementById("StationIName");
	var index = dropdown.selectedIndex;
	var stationName = dropdown.options[index].text;
    if (index != 0){
	$.getJSON("stationDetails", null, function(data) {
		var stationDetails = data;
		var heading = "<p id = heading> <b>Station Name: </b>" + stationName + "<br>";
        var list = "<ul>"
		//var RealTimeTable = "<table class ='StationTable'>";
		//RealTimeTable += "<tr><th>Bikes Available</th><th>Stands Available</th><th>Last Update</th></tr>";
       
		var latitude;
		var longitude;
		var icon;
		$.each(stationDetails, function(station) {
			if (stationName == stationDetails[station].StationIName) {
				var id = "<b>Station ID: </b>" + stationDetails[station].Station_ID
				var availableBikes = stationDetails[station].available_bikes;
				var availableStands = stationDetails[station].available_bike_stands;
				var update = stationDetails[station].last_update;
				latitude = parseFloat(stationDetails[station].latitude);
				longitude = parseFloat(stationDetails[station].longitude);
				
                list += "<b><li>Bikes Available</b> <br>" + availableBikes+"</li><li> <b>Stands Available</b> <br>"+ availableStands+"</li><li><b>Last Update</b> <br>"+ update+"</li>";
				heading += id + "</p>";
                
                
				if (availableBikes > availableStands + 10) {
					icon = '..//static/images/marker_green.png';
				} else if (availableStands > availableBikes + 10) {
					icon = '..//static/images/marker_red.png'
				} else {
					icon = '..//static/images/marker_orange.png';
				}
				var marker = new google.maps.Marker({
					position: {
						lat: latitude,
						lng: longitude
					},
					map: map,
					icon: icon
				});
				map.setZoom(16);
				map.setCenter({
					lat: latitude,
					lng: longitude
				});
			}
		})
        list +="</ul>"
		//RealTimeTable += "</table>"
		document.getElementById("infoBox").innerHTML = heading + list;
		document.getElementById("map").innerHTML;
		showChart();
	});
    }
    else{
        document.getElementById("infoBox").innerHTML = ""
        document.getElementById('weatherInfo').innerHTML = "";
    }
}

//Display weather Forecast
function displayForecast() {
	$.getJSON("forecast", null, function(data) {
		var weather = data;
        var list = "<ul>"
        var text = ""
		var i = 0;
		while (i < 8) {
			var initTime = weather[i].dt_txt;
			var split = initTime.split(" ")
			var time = split[1].slice(0, 5);
			var descrip = weather[i].description;
			var icon = weather[i].icon;
			var temp = weather[i].temp;
            list += "<b><li>"+ time + "<br></b><img class='icons' src='http://openweathermap.org/img/w/" + icon + ".png'/></li>";
			i++
        }
                   
        list += "</ul>";
                
		document.getElementById("weatherInfo").innerHTML = list;
	});
}

//Display text to warn of Rain
function displayWarning(){
    console.log("Warning")
    $.getJSON("forecast", null, function(data){
        var weather = data;
        var descrip;
        var text = "";
        var i = 0;
        while (i < 8) {
            descrip = weather[i].description;  
                    if (descrip.indexOf("rain") || descrip.indexOf("drizzle")  ){
        
                        text += "<b>There tends to be more bikes available at stations when it's raining!</b>";
                        break;
            }         
        i++;
    }
        document.getElementById("textForecast").innerHTML = text;
        
    });    

}

//Get directions from one station to another using dropdown list
$(document).ready(function() {
	$("#directionDropdown").change(function() {
		var start = document.getElementById('start').value,
			end = document.getElementById('end').value,
			startList = start.split(","),
			endList = end.split(","),
			startLat = startList[0],
			startLong = startList[1],
			endLat = endList[0],
			endLong = endList[1];
		showDirectionsMap(startLat, startLong, endLat, endLong)
         document.getElementById("weather").innerHTML = "";
		document.getElementById('elevationChartName').style.display = "block";
        document.getElementById('success').innerHTML = "";
        document.getElementById('error').innerHTML = "";
        var canvas = document.getElementById('myChart')
    canvas.destroy;
    var ctx = canvas.getContext('2d');
    ctx.destroy;
	});
});

//Find stations nearby
$(document).on("click", "#findStationsNearby", function() {
    document.getElementById('textForecast').innerHTML="";
	var StationDiv = document.getElementById("nearbyStations");
    $("canvas#myChart").remove();
$("div.myChart").append('<canvas id="chartreport" class="animated fadeIn" height="150"></canvas>');
	var Userlat;
	var UserLng;
	getLocation();
    showLocationLegend();
	//Getting geolocation of user
	function getLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(findNearbyStations);
		} else {
			StationDiv.innerHTML = "Geolocation is not supported by this browser.";
		}
	}
});

//Function that takes user position as parameter to find nearby stations
function findNearbyStations(position) {
	var list = [];
	var stationList = [];
	var Userlat = position.coords.latitude;
	var UserLng = position.coords.longitude;
	var userCord = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	var infoWindow = new google.maps.InfoWindow()
	$.getJSON("stations", null, function(data) {
		$.getJSON('stationDetails', null, function(stationData) {
			var stationLocation = data;
			var stationRealTime = stationData;
			$.each(stationLocation, function(findStation) {
				var name = stationLocation[findStation].StationIName;
				var lat = parseFloat(stationLocation[findStation].Latitude);
				var lng = parseFloat(stationLocation[findStation].Longitude);
				var availableBikes = stationRealTime[findStation].available_bikes;
				var availableStands = stationRealTime[findStation].available_bike_stands;
				var update = stationRealTime[findStation].last_update;
				var stationCord = new google.maps.LatLng(lat, lng);
				var dist = (google.maps.geometry.spherical.computeDistanceBetween(stationCord, userCord) / 1000);
				list.push({
					Dist: dist,
					Name: name,
					AvailableBike: availableBikes,
					AvailableStand: availableStands,
					LastUpdate: update,
					Lat: lat,
					Lng: lng
				});
			});
			list.sort(function(a, b) {
				return a['Dist'] - b['Dist']
			});
			stationList = list.slice(0, 5);
            var NearbyTable = "<table class ='NearbyStationTable'><tr><th>Station</th><th>Bikes Available</th><th>Stands Available</th><th>Last Update</th></tr>";
			
            map = new google.maps.Map(document.getElementById('map'), {
				center: {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				},
				zoom: 13,
			});
			var UserLocation = new google.maps.Marker({
				position: {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				},
				map: map,
				icon: '..//static/images/marker_blue.png'
			});
			google.maps.event.addListener(UserLocation, 'click', (function(UserLocation, stationList) {
				return function() {
					var content = "<b> Current Location</b>";
					infoWindow.setContent(content)
					infoWindow.open(map, UserLocation);
				}
			})(UserLocation, stationList));
			for (i = 0; i < 5; i++) {
				NearbyTable += "<tr><td>" + stationList[i]['Name'] + "</td><td>" + stationList[i]['AvailableBike'] + "</td><td>" + stationList[i]['AvailableStand'] + "</td><td>" + stationList[i]['LastUpdate'] + "</td></tr>";
				var marker = new google.maps.Marker({
					position: {
						lat: stationList[i]['Lat'],
						lng: stationList[i]['Lng']
					},
					map: map,
					title: stationList[i]['Name'],
					icon: '..//static/images/marker_green.png'
				});
				marker.metadata = {
					type: "point",
					title: stationList[i]['Name']
				};
				google.maps.event.addListener(marker, 'click', (function(marker, stationList) {
					return function() {
						for (i = 0; i < 5; i++) {
							if (stationList[i]['Name'] == marker.metadata.title) {
								var content = "" + stationList[i]['Name'] + ": " + stationList[i]['LastUpdate'] + "<br>Stands: " + stationList[i]['AvailableBike'] + "<br>Bikes: " + stationList[i]['AvailableStand'] + "<br>Distance: " + stationList[i]['Dist'].toFixed(2) + "km";
								infoWindow.setContent(content)
								infoWindow.open(map, marker);
							}
						}
					}
				})(marker, stationList));
			};
            NearbyTable += "</table>"
            document.getElementById('weatherInfo').innerHTML = ""
			document.getElementById("infoBox").innerHTML = NearbyTable;
		})
	})
}

//Show directions from start to finish
function showDirectionsMap(startLat, startLong, endLat, endLong) {
	var directionsService = new google.maps.DirectionsService;
	var directionsDisplay = new google.maps.DirectionsRenderer;
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		center: {
			lat: 53.3498053,
			lng: -6.260309699999993
		}
	});
	var lat = [startLat, endLat];
	var long = [startLong, endLong];
	for (var i = 0; i < 2; i++) {
		var journeyMarker = new google.maps.Marker({
			position: {
				lat: parseFloat(lat[i]),
				lng: parseFloat(long[i])
			},
		});
		directionsDisplay.setMap(map);
		//directionsDisplay.setPanel(document.getElementById('direction-panel'));
		var origin = [startLat, startLong],
			destination = [endLat, endLong];
		calculateAndDisplayRoute(directionsService, directionsDisplay, origin, destination);
		showElevation(origin, destination)
	};
}

//Function that calculates distances between two points
function calculateAndDisplayRoute(directionsService, directionsDisplay, origin, destination) {
	directionsService.route({
		origin: {
			lat: parseFloat(origin[0]),
			lng: parseFloat(origin[1])
		},
		destination: {
			lat: parseFloat(destination[0]),
			lng: parseFloat(destination[1])
		},
		travelMode: 'BICYCLING'
	}, function(response, status) {
		document.getElementById('direction-panel').innerHTML = ""
		directionsDisplay.setDirections(response);
		directionsDisplay.setPanel(document.getElementById('direction-panel'));
	});
}

//Show elevation of the path selected by user. 
function showElevation(origin, destination) {
	var path = [{
		lat: parseFloat(origin[0]),
		lng: parseFloat(origin[1])
	}, {
		lat: parseFloat(destination[0]),
		lng: parseFloat(destination[1])
	}];
	var elevator = new google.maps.ElevationService;
	elevator.getElevationAlongPath({
		'path': path,
		'samples': 300
	}, plotElevation);
}

//Function to plot the elevation chart
function plotElevation(elevations, status) {
	var chartDiv = document.getElementById('elevation_chart');
	if (status !== 'OK') {
		chartDiv.innerHTML = 'Cannot show elevation: request failed because ' + status;
		return;
	}
	var chart = new google.visualization.ColumnChart(chartDiv);
	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Sample');
	data.addColumn('number', 'Elevation');
	for (var i = 0; i < elevations.length; i++) {
		data.addRow(['', elevations[i].elevation]);
	}
	chart.draw(data, {
		height: 200,
		legend: 'none'
	});
}

//Pull station info from JSON file to display in chart
function showChart() {
    $("canvas#myChart").remove();
document.getElementById('graph-container').innerHTML = '<canvas id="myChart" class="animated fadeIn" height="150"></canvas>';
	var d = new Date();
	var n = d.getDay();
	var dayList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var dropdown = document.getElementById("StationIName");
	var index = dropdown.selectedIndex;
	var stationName = dropdown.options[index].text;
	var stationList = [];
	$.getJSON("json", function(data) {
		for (i = 0; i < data.length; i++) {
			if (stationName == data[i][0] && dayList[n] == data[i][1]) {
				stationList.push(data[i])
			}
		};
		var data = stationList.map(function(e) {
			return e[4];
		});
		var labels = stationList.map(function(e) {
			return e[2];
		})
        var ctx = document.getElementById('myChart').getContext('2d');
		var chart = new Chart(ctx, {
			// The type of chart we want to create
			type: 'bar',
			// The data for our dataset
			data: {
				labels: labels,
				datasets: [{
					label: "Bike Availability",
					backgroundColor: 'rgba(42, 109, 252, 0.9)',
					borderColor: 'rgb(3, 70, 214)',
					data: data
				}]
			},
			// Configuration options go here
			options : {
                scales: {
                    xAxes: [{ scaleLabel: {
                        display: true, 
                        labelString: 'Hours in day'
                    }}],
                yAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'Average Available Bikes'
                  }
                }],
              }
            }
		});
	});
};

$(document).ready(function() {
    $('#submit_btn').click(function(event) {
        $.ajax({
            data:{
                day : $('#day').val(),
                time : $('#time').val(),
                station : $('#predictionStation').val()
            },
            type : 'POST',
            url : '/getModel'
        }).done(function(result) {
            if (result.error){
                console.log("error")
                document.getElementById('success').innerHTML = "";
                document.getElementById('error').innerHTML = result.error;}
            else{
                console.log(result)
               document.getElementById('elevation_chart').innerHTML = "";
                document.getElementById('elevationChartName').style.display="none";
                document.getElementById('direction-panel').innerHTML = "";
                document.getElementById('error').innerHTML = "";
                document.getElementById('success').innerHTML = "<b>Weather forecast:</b> "+result[0].weather+"<br><br><b>Predicted Bikes available: </b>"+result[5].result;
            }});

        event.preventDefault();
        });
        });