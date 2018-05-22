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

	var spButtonsByFamily = {};

	var overlayBackButton = document.createElement("button");
	overlayBackButton.id = "overlay-back";
	overlayBackButton.innerText = "<--"
	overlayBackButton.addEventListener("click", function() {
		var overlay = this.parentElement;
		overlay.style.zIndex = "-1";

		var map = document.getElementById("bird-map");
		map.style.visibility = "hidden";
		map.style.zIndex = "-1";

		var photoBox = document.getElementById("bird-photoBox");
		photoBox.style.visibility = "hidden";
		photoBox.style.zIndex = "-1";
		$(photoBox).empty();

		$(overlay).empty();

	  	var backgroundList = document.getElementById("order-list");
		backgroundList.style.visibility = "visible";
	});

	var orderList = document.createElement("div");
	orderList.id = "order-list";

	var imagesBySpecies = {};
	var photoBox = getComputedStyle(document.getElementById("bird-photoBox"));

	var maxImgWidth = photoBox.width;
	var maxImgHeight = photoBox.height;

	for (order in orderFamilies) {
		var orderHeader = document.createElement("button");
		orderHeader.classList.add("order-header");
		orderHeader.innerText = order;

		var familyList = document.createElement("div");
		familyList.classList.add("family-list");

		var noSightings = true;
		for (f in orderFamilies[order]) {
			family = orderFamilies[order][f];

			familyHeader = document.createElement("button");
			familyHeader.innerText = family;
			speciesList = document.createElement("div");

			if (familySpecies[family]) {

				spButtonsByFamily[family] = [];

				// prep button dictionary for overlays
				for (c in familySpecies[family]) {
					common = familySpecies[family][c];
					spButton = document.createElement("button");
					spButton.classList.add("species");
					spButton.innerText = common;

			  		var imgPath = "Media/Bird_Photos/" + common + ".jpg";
			  		var imgLink = document.createElement("A");
			  		imgLink.href = imgPath;
			  		imgLink.target = "_blank";

					// test for image
					var spImg = document.createElement("img");
					spImg.onerror = function() { 
							this.alt = "No Image";
							this.style.display = "none";
							this.parentElement.href="none";
					};

					spImg.alt = common + " photo by LT";
			  		spImg.src = imgPath;
			  		spImg.style.maxWidth = maxImgWidth;
			  		spImg.style.maxHeight = maxImgHeight;
			  		spImg.classList.add("bird-img");

			  		imgLink.append(spImg);
			  		imagesBySpecies[common] = imgLink;;

					spButton.addEventListener("click", function() {
						var common = this.innerText;
					  	map.removeLayer(heatMapLayer);
					  	var latlons = locations[common];
				  		var heatData = new ol.source.Vector();

				  		var centerCoord = ol.proj.fromLonLat([-76.3, 38]);
					  	for (var l = 0; l < latlons.length; l++) {
					  		var lat = parseFloat(latlons[l][0]);
					  		var lon = parseFloat(latlons[l][1]);
					  		if (isNaN(lon) || isNaN(lat)) { continue; }
					  		
					  		var coord = ol.proj.fromLonLat([lon, lat]);
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

  					  	var photoBox = document.getElementById("bird-photoBox");
					  	$(photoBox).empty();

					  	var spImg = imagesBySpecies[common];
  					  	photoBox.append(spImg);
					});

					spButtonsByFamily[family].push(spButton);
				}

				noSightings = false;
				familyHeader.classList.add("family-header");

				familyHeader.addEventListener("click", function() {
					family = this.innerText;
				  	this.classList.toggle("active");
				  	var overlay = document.getElementById("species-overlay");
				  	var guide = getComputedStyle(overlay.parentElement);

				  	overlay.append(overlayBackButton);
				  	var speciesList = document.createElement("ul");
				  	speciesList.classList.add("species-list");
				  	for (b in spButtonsByFamily[family]) {
				  		sp = document.createElement("li");
				  		sp.append(spButtonsByFamily[family][b]);
				  		speciesList.append(sp);
				  	}

				  	overlay.append(speciesList);
				  	overlay.style.zIndex = "2";
				  	overlay.style.width = guide.width;
				  	overlay.style.height = "100%";

				  	var map = document.getElementById("bird-map");
				  	map.style.zIndex = "2";
				  	map.style.visibility = "visible";

				  	var photoBox = document.getElementById("bird-photoBox");
				  	photoBox.style.zIndex = "2";
				  	photoBox.style.visibility = "visible";

				  	var backgroundList = document.getElementById("order-list");
				  	backgroundList.style.visibility = "hidden";
				});
			} 
			else {
				familyHeader.classList.add("family-header-none");
			}

			familyList.append(familyHeader);
		}

		if (noSightings) {
			orderHeader.classList.add("order-header-none");
		}
		else {
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
		}

		if (order == "Passeriformes") {
			orderHeader.id = "last";
		}
		orderList.append(orderHeader);
		orderList.append(familyList);
	}

	$("#eBird-data").append(orderList);
})
})
});