$.get("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/papers_list.txt",
function(papersListRaw) 
{

	var paperFiles = fs.readdirSync("./Media/Papers/");

	findPaperLink = function(author, year) {

		var firstMatches = [];
		for (var i=0; i<paperFiles.length; i++) {
			if (paperFiles[i].match(author))
				firstMatches.push(i);
		}	

		var jointMatches = [];
		for (var j=0; j<firstMatches.length; j++) {
			if (paperFiles[firstMatches[j]].match(year)) {
				jointMatches.push(firstMatches[j]);
			}
		}

		paperFile = paperFiles[jointMatches[0]];

		return "./Media/Papers/" + paperFile;
	}

	arrangeLink = function(citation) {
		let firstAuthor = citation.split(',')[0];
		let year = citation.match(/^\d+|\d+\b|\d+(?=\w)/g)[0];

		filePath = findPaperLink(firstAuthor, year);

		let a = document.createElement("a");
		a.href = filePath;
		a.classList.add("citation");
		a.innerHTML = citation;

		return a;
	}

	var papersList = papersListRaw.split("\n");

	for (var i = papersList.length; i > 0; i--) {
		let paper = papersList[i];
		if (paper && paper != "") {
			p = arrangeLink(paper);
			// let p = document.createElement("p");
			// p.classList.add("citation");
			// p.innerHTML = paper;
			$("#papers").append(p);
			$("#papers").css("background", "white");
		}
	}
});