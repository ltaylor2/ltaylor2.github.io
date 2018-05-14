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

	// pass through list to isolate all individual species
	for (var i=0; i<birdArray_raw.length; i++) {
		var obs = birdArray_raw[i];
		var common = obs[colNames["common"]];
		var scientific = obs[colNames["scientific"]];
		var count = obs[colNames["count"]];
		if (count == "X") { count = 1; }
		else { count = parseInt(count); }

		if (!(common in species)) {
			species[common] = scientific;
			counts[common] = count;
		} else {
			counts[common] += count;
		}
	}

	var table = "<table><tbody>";
	for (var key in species) {
		table += "<tr>";
		table += "<td>" + key + "</td>";
		table += "<td><em>" + species[key] + "</em></td>";
		table += "<td>" + counts[key] + "</td>";
		table += "</tr>";
	}
	table += "</tbody></table>";

	$("#eBird-data").append(table);
});

