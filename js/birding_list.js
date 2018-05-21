$.get("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/eBird/MyEBirdData.csv", function(data_obs) {
$.getJSON("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/eBird/order_families.json", function(orderFamilies) {
$.getJSON("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/eBird/species_families.json", function(speciesFamilies) {
	var rows = data_obs.split("\n");
	
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
	var familySpecies = {};
	for (var r=1; r<rows.length; r++) {
		row = rows[r].split(",");
		var common = row[colNames["common"]];
		var scientific = row[colNames["scientific"]];
		var count = row[colNames["count"]];
		var location = [row[colNames["latitude"]], row[colNames["longitude"]]]
		if (count == "X") { count = 1; }
		else { count = parseInt(count); }

		if (!(common in species)) {
			species[common] = scientific;
			counts[common] = count;
			locations[common] = [];
			locations[common].push(location);
			var family = speciesFamilies[common];
			if (!(family in familySpecies)) {
				familySpecies[family] = [];
			}
			familySpecies[family].push(common);

		} else {
			counts[common] += count;
			locations[common].push(location);
		}
	}

	var orderList = document.createElement("div");
	orderList.id = "order-list";

	for (order in orderFamilies) {
		var orderHeader = document.createElement("button");
		orderHeader.classList.add("order-header");
		orderHeader.innerText = order;

		orderHeader.addEventListener("click", function() {
		  	this.classList.toggle("active");
		  	this.classList.add("order-header-active");
		    var panel = this.nextElementSibling;
		    if (panel.style.maxHeight){
		    	this.classList.remove("order-header-active");
		    	panel.style.maxHeight = null;
		    } else {
		      	panel.style.maxHeight = panel.scrollHeight + "px";
		    }
		});

		var familyList = document.createElement("div");
		familyList.classList.add("family-list");

		for (f in orderFamilies[order]) {
			family = orderFamilies[order][f];

			familyHeader = document.createElement("button");
			familyHeader.innerText = family;
			speciesList = document.createElement("div");

			if (familySpecies[family]) {
				familyHeader.classList.add("family-header");

				familyHeader.addEventListener("click", function() {
				  	this.classList.toggle("active");
				  	this.classList.add("family-header-active");
				    var panel = this.nextElementSibling;
				    var overPanel = this.parentElement;
				    if (panel.style.maxHeight){
				    	this.classList.remove("family-header-active");
				    	overPanel.style.maxHeight = (parseInt(overPanel.style.maxHeight, 10) - parseInt(panel.style.maxHeight, 10)) + "px";
				    	panel.style.maxHeight = null;
				    } else {
				    	overPanel.style.maxHeight = parseInt(overPanel.style.maxHeight, 10) + panel.scrollHeight + "px";
				      	panel.style.maxHeight = panel.scrollHeight + "px";
				    }
				});

				speciesList.classList.add("species-list");

				speciesList.innerHTML += "<ul>";

				for (c in familySpecies[family]) {
					common = familySpecies[family][c];
					sp = document.createElement("li");
					sp.innerText = common;
					speciesList.append(sp);
				}
				speciesList.innerHTML += "</ul>";
			} else {
				familyHeader.classList.add("family-header-none");
			}

			familyList.append(familyHeader);
			familyList.append(speciesList);
		}

		orderList.append(orderHeader);
		orderList.append(familyList);
	}

	$("#eBird-data").append(orderList);
})
})
});

	// var list = "<ul id=\"bird-list\">";
	// for (var key in species) {
	// 	list += "<li><button class=\"species\">" + key + "</button></li>";
	// }
	// list += "</ul>";

	// $("#eBird-data").append(list);

	// var speciesButtons = document.getElementsByClassName("species");
	// for (var i = 0; i < speciesButtons.length; i++) {
	//   speciesButtons[i].addEventListener("click", function() {
	//     this.classList.toggle("active");
	//   	map.removeLayer(heatMapLayer)
	//   	var common = this.innerText;
	//   	var latlons = locations[common];
 //  		var heatData = new ol.source.Vector();

 //  		var centerCoord = ol.proj.fromLonLat([-76.3, 38]);
	//   	for (var l = 0; l < latlons.length; l++) {
	//   		var lat = parseFloat(latlons[l][0]);
	//   		var lon = parseFloat(latlons[l][1]);
	//   		if (isNaN(lon) || isNaN(lat)) { continue; }
	  		
	//   		var coord = ol.proj.fromLonLat([lon, lat]);
	//   		centerCoord = coord;
	//   		var point = new ol.geom.Point(coord);
	//   		var pointFeature = new ol.Feature({
	//   			geometry: point,
	//   			weight: 1,
	//   		});
	//   		heatData.addFeature(pointFeature);
	//   	}

	//   	heatMapLayer = new ol.layer.Heatmap({
	//   		source: heatData,
	//   		opacity: 0.5,
	//   	});

	//   	map.addLayer(heatMapLayer);
	//   	map.getView().centerOn(centerCoord, [1,1], [0,0]);
	// });
	// }