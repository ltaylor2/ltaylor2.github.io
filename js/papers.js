$.get("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/papers_list.txt",
function(papersListRaw) 
{

	arrangeLink = function(citation) {
		let firstAuthor = citation.split(',')[0];
		let year = citation.match(/^\d+|\d+\b|\d+(?=\w)/g)[0];

		filePath = findPaperLink(firstAuthor, year);

		let a = document.createElement("a");
		a.href = "./Media/Papers/" + firstAuthor + " " + year + ".pdf";
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