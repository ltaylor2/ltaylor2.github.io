var pendingMessage = document.createElement("p");
pendingMessage.id = "pending-message";
pendingMessage.innerText = "Loading checklist and images";
$("#eBird-data").prepend(pendingMessage);

var prom_Obs = $.get("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/eBird/MyEBirdData.csv",
function(obsData) 
{
	return new Promise(function(resolve) {
		resolve(obsData);
	});
});

var prom_Orders = $.getJSON("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/eBird/order_families.json", 
function(familiesByOrder) 
{
	return new Promise(function(resolve) {
		resolve(familiesByOrder);
	});
});

var prom_Families = $.getJSON("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/eBird/species_families.json", 
function(speciesByFamily) 
{
	return new Promise(function(resolve) {
		resolve(speciesByFamily);
	});
});

var prom_hasImgList = $.getJSON("https://api.github.com/repos/ltaylor2/ltaylor2.github.io/contents/Media/Smaller_Bird_Photos", 
function(hasImgRaw)  
{
	return new Promise(function(resolve) {
		resolve(hasImgRaw);
	});
});

Promise.all([prom_Obs, prom_Orders, prom_Families, prom_hasImgList]).then(function(values) 
{
	obsData = values[0];
	familiesByOrder = values[1];
	speciesByFamily = values[2];
	hasImgRaw = values[3];

	// formatting eBird CSV observation data into array
	let rows = obsData.split("\n");
	
	let colNames = {"id":0, 
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

	var scientificByCommon = {};
	var counts = {};
	var locations = {};
	var families = {};

	// extract species from eBird CSV
	for (let r=1; r<rows.length; r++) {
		row = rows[r].split(",");
		let common = row[colNames["common"]];
		let scientific = row[colNames["scientific"]];
		let count = row[colNames["count"]];
		let location = [row[colNames["latitude"]], row[colNames["longitude"]]]
		if (count == "X") { count = 1; }
		else { count = parseInt(count); }

		if (!(common in scientificByCommon)) {
			scientificByCommon[common] = scientific;
			counts[common] = count;
			locations[common] = [];
			locations[common].push(location);
			let family = speciesByFamily[common];
			if (!(family in families)) {
				families[family] = [];
			}
			families[family].push(common);

		} else {
			counts[common] += count;
			locations[common].push(location);
		}
	}

	// extracting has-image list from GitHub API metadata
	var hasImgList = {};
	for (i in hasImgRaw) {
		let nameStr = hasImgRaw[i]["name"];
		nameStr = nameStr.substr(0, nameStr.lastIndexOf("."));
		hasImgList[nameStr] = nameStr;
	}

	// build the species lists by family, 
	// waiting for images to query within the function
	// and waiting for complete resolve before adding orderList
	var spButtonsByFamily = makeSpeciesButtons(families, locations, scientificByCommon, hasImgList);

	var overlayBackButton = makeOverlayBack();

	var orderList = document.createElement("div");
	orderList.id = "order-list";

	Promise.all(flatten(spButtonsByFamily)).then(function() {
		let orderCounter = 0;

		for (order in familiesByOrder) {
			let {familyList, noSightings} = makeFamilyList(order, familiesByOrder, families, spButtonsByFamily, overlayBackButton);
			if (!noSightings) {
				orderCounter += 1;
			}
			let orderHeader = makeOrderHeader(order, noSightings);
				orderList.append(orderHeader, familyList);
		}

		$("#pending-message").remove();
		$("#eBird-data").append(orderList);

		let speciesCounter = Object.keys(scientificByCommon).length;
		let sC = document.getElementById("species-counter");
		sC.innerText = speciesCounter;
		sC.style.background = "white";

		let oC = document.getElementById("order-counter");
		oC.innerText = orderCounter;
		oC.style.background = "white";

		let orderTotal = Object.keys(familiesByOrder).length;
		let oT = document.getElementById("order-total");
		oT.innerText = orderTotal;
		oT.style.background = "white";

		let familyCounter = Object.keys(families).length;
		let fC = document.getElementById("family-counter");
		fC.innerText = familyCounter;
		fC.style.background = "white";

		let familyTotal = flatten(familiesByOrder).length;
		let fT = document.getElementById("family-total");
		fT.innerText = familyTotal;
		fT.style.background = "white";
	});

});


function makeSpeciesButtons(families, locations, scientificByCommon, hasImgList) 
{
	var photoBox = document.getElementById("bird-photoBox");
	var guide = getComputedStyle(photoBox)
	var maxWidth = guide.width;
	var maxHeight = guide.height;

	var spButtonsByFamily = {};

	for (family in families) {
		spButtonsByFamily[family] = [];
		for (c in families[family]) {
			common = families[family][c];
			let hasImg = false;
			if (hasImgList[common] != null) {
				hasImg = true;
			}
			let prom_spImg = promSpImage(common, family, maxWidth, maxHeight, hasImg);

			spButtonsByFamily[family].push(prom_spImg.then(function(values) {
				let imgLink = values[0];
				let common = values[1];
				let family = values[2];
				let spB = makeSpButton(common, locations[common],
									   scientificByCommon[common], imgLink);
				return spB;
			}));
		}
	}

	return spButtonsByFamily;
}


function makeSpButton(common, latlons, scientific, imgLink) 
{
	var spButton = document.createElement("button");
	spButton.classList.add("species");
	spButton.id = common;
	spButton.innerText = common;
	if (imgLink) {
		spButton.classList.add("has-img");
	}

	spButton.addEventListener("click", function() {
		let common = this.innerText;
	  	map.removeLayer(heatMapLayer);
		let heatData = new ol.source.Vector();

		let centerCoord = ol.proj.fromLonLat([-76.3, 38]);
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

	  	let label = document.getElementById("species-labelBox");
	  	$(label).empty();

	  	spLabelCommon = document.createElement("p");
	  	spLabelCommon.innerText = common;
	  	spLabelCommon.id = "species-label-common";

	  	spLabelScientific = document.createElement("p");
	  	spLabelScientific.innerText = scientific;
	  	spLabelScientific.id = "species-label-scientific";

	  	label.append(spLabelCommon);
	  	label.append(spLabelScientific);

	  	let photoBox = document.getElementById("bird-photoBox");
	  	$(photoBox).empty();

	  	if (imgLink) {
		  	photoBox.append(imgLink);
	  	}
	});

	return spButton;
}

function promSpImage(common, family, maxWidth, maxHeight, hasImg) 
{
	var promise = new Promise(function(resolve) {

		var imgLink = document.createElement("A");

		if (hasImg) {
			var imgPath = "./Media/Medium_Bird_Photos/" + common + ".jpg";
			imgLink.href = imgPath;
			imgLink.target = "_blank";

			var spImg = document.createElement("img");
			spImg.classList.add("bird-img");
			spImg.onerror = function() { 
				resolve([null, common, family]);
			};

			spImg.onload = function() {
				imgLink.append(spImg);
				resolve([imgLink, common, family]);
			};

			spImg.alt = common;
			spImg.src = imgPath;
			spImg.style.maxWidth = maxWidth;
			spImg.style.maxHeight = maxHeight;
		} else {
			resolve([null, common, family]);
		}
	});
	return promise;
}

function makeOrderHeader(order, noSightings) 
{
	var orderHeader = document.createElement("button");
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

	if (noSightings) {
		orderHeader.classList.add("order-header-none");
	} else {
		orderHeader.classList.add("order-header");
	}

	if (order == "Passeriformes") {
		orderHeader.id = "last";
	}
	return orderHeader;
}

function makeFamilyList(order, familiesByOrder, families, spButtonsByFamily, overlayBackButton)
{
	var fL = document.createElement("div");
	fL.classList.add("family-list");

	var noS = true;
	for (f in familiesByOrder[order]) {
		let family = familiesByOrder[order][f];
		familyHeader = document.createElement("button");
		familyHeader.innerText = family;

		if (families[family]) {
			noS = false;
			familyHeader.classList.add("family-header");
			familyHeader.addEventListener("click", function() {
				sessionStorage.scrollLogger = document.documentElement.scrollTop;
				document.documentElement.scrollTop = 0;

				family = this.innerText;
			  	this.classList.toggle("active");
			  	var overlay = document.getElementById("species-overlay");
			  	var guide = getComputedStyle(overlay.parentElement);

			  	overlay.append(overlayBackButton);

			  	var familyLabel = document.createElement("p");
			  	familyLabel.id = "family-label";
			  	familyLabel.innerText = family.split("(")[1].split(")")[0];
			  	overlay.append(familyLabel);

			  	var speciesList = document.createElement("ul");
			  	speciesList.classList.add("species-list");
			  	for (b in spButtonsByFamily[family]) {
			  		let sp = document.createElement("li");
			  		spButtonsByFamily[family][b].then(function(button) {
			  			sp.append(button);
			  		});
			  		speciesList.append(sp);
			  	}

			  	overlay.append(speciesList);
			  	overlay.style.zIndex = "2";

			  	var map = document.getElementById("bird-map");
			  	map.style.visibility = "visible";
			  	map.style.zIndex = "2";

			  	var label = document.getElementById("species-labelBox");
			  	label.style.visibility = "visible";
			  	label.style.zIndex = "2";

			  	var photoBox = document.getElementById("bird-photoBox");
			  	photoBox.style.visibility = "visible";
			  	photoBox.style.zIndex = "2";

			  	var backgroundList = document.getElementById("order-list");
			  	backgroundList.style.display = "none";

	  			var aboutInfo = document.getElementById("bird-about");
				aboutInfo.style.display = "none";
			});
		} else {
			familyHeader.classList.add("family-header-none");
		}
		fL.append(familyHeader);
	}
	// TODO need to return noSightings value in array?
	return {familyList: fL, noSightings: noS};
}

function makeOverlayBack() {
	var overlayBackButton = document.createElement("button");
	overlayBackButton.id = "overlay-back";
	overlayBackButton.innerText = "< Back"
	overlayBackButton.addEventListener("click", function() {
		let overlay = this.parentElement;
		overlay.style.zIndex = "-1";

		let map = document.getElementById("bird-map");
		map.style.visibility = "hidden";
		map.style.zIndex = "-1";

	  	let label = document.getElementById("species-labelBox");
	  	label.style.visibility = "hidden";
	  	label.style.zIndex = "-1";
	  	$(label).empty();

		let photoBox = document.getElementById("bird-photoBox");
		photoBox.style.visibility = "hidden";
		photoBox.style.zIndex = "-1";
		$(photoBox).empty();

		$(overlay).empty();

	  	let backgroundList = document.getElementById("order-list");
		backgroundList.style.display = "block";
		document.documentElement.scrollTop = sessionStorage.scrollLogger;

		let aboutInfo = document.getElementById("bird-about");
		aboutInfo.style.display = "block";
	});

	return overlayBackButton;
}

function flatten(nestedDict) {
	var flatArray = [];
	for (key in nestedDict) {
		for (i in nestedDict[key]) {
			let value = nestedDict[key][i];
			flatArray.push(value);
		}
	}
	return flatArray;
}