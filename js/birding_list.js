$.get("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/MyEBirdData.csv", function(data) {
	var birdArray_raw = new Array();
	var rows = data.split("\n");
	for (var r=1; r<rows.length; r++) {
		birdArray_raw[r-1] = rows[r].split(",");
	}
	var colNames = {"id":0, 
					"common":1, 
					"scientific":2,
					"order":3, 
					"count":4, 
					"state":5, 
					"country":6,
					"location":7,
					"latitude":8,
					"longitude":9,
					"date":10,
					"time":11, 
					"protocol":12, 
					"duration":13, 
					"allReported":14, 
					"distance":15, 
					"area":16,
					"numObservers":17, 
					"breedingCode":18, 
					"spComments":19, 
					"clComments":20};

	var species = {};
	var counts = {};
	var locations = {};

	// pass through list to isolate all individual species
	for (var i = 0; i < birdArray_raw.length; i++) {
		var obs = birdArray_raw[i];
		var common = obs[colNames["common"]];
		var scientific = obs[colNames["scientific"]];
		var count = obs[colNames["count"]];
		var location = [obs[colNames["latitude"]], obs[colNames["longitude"]]]
		if (count == "X") { count = 1; }
		else { count = parseInt(count); }

		if (!(common in species)) {
			species[common] = scientific;
			counts[common] = count;
			locations[common] = new Array();
			locations[common].push(location);
		} else {
			counts[common] += count;
			locations[common].push(location);
		}
	}

	var table = "<table><tbody>";
	for (var key in species) {
		table += "<tr>";
		table += "<td><button class=\"species\">" + key + "</button></td>";
		table += "<td><em>" + species[key] + "</em></td>";
		table += "<td>" + counts[key] + "</td>";
		table += "</td>";
	}
	table += "</tbody></table>";

	$("#eBird-data").append(table);
	var speciesButtons = document.getElementsByClassName("species");
	for (var i = 0; i < speciesButtons.length; i++) {
	  speciesButtons[i].addEventListener("click", function() {
	    this.classList.toggle("active");
	  	map.removeLayer(heatMapLayer)
	  	var common = this.innerText;
	  	var latlons = locations[common];
  		var heatData = new ol.source.Vector();

  		var centerCoord = []
	  	for (var l = 0; l < latlons.length; l++) {
	  		var lon = parseFloat(latlons[l][0]);
	  		var lat = parseFloat(latlons[l][1]);
	  		if (isNaN(lon) || isNaN(lat)) { continue; }
	  		
	  		console.log([lon, lat]);
	  		var coord = ol.proj.fromLonLat([lat, lon]);
	  		centerCoord = coord;
	  		var point = new ol.geom.Point(coord);
	  		var pointFeature = new ol.Feature({
	  			geometry: point,
	  			weight: 1,
	  		});
	  		heatData.addFeature(pointFeature);
	  	}

	  	heatMapLayer = new ol.layer.Heatmap({
	  		source: heatData,
	  		opacity: 0.5,
	  	});

	  	map.addLayer(heatMapLayer);
	  	map.getView().centerOn(centerCoord, [1,1], [0,0]);
	});
	}
});