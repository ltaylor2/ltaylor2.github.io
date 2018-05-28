$.get("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/papers_list.txt",
function(papersListRaw) 
{
	var papersList = papersListRaw.split("\n");

	for (var i = papersList.length; i > 0; i--) {
		let citation = papersList[i];
		if (paper != "") {
			let p = document.createElement("p"):
			p.classList.add("citation");
			p.innerText = citation;
			$("#papers").append(p);
		}
	}
});