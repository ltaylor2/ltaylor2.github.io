$.get("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/papers_list.txt",
function(papersListRaw) 
{
	var papersList = papersListRaw.split("\n");

	for (var i = papersList.length; i > 0; i--) {
		let paper = papersList[i];
		if (paper && paper != "") {
			let p = document.createElement("p");
			p.classList.add("citation");
			p.innerHTML = paper;
			$("#papers").append(p);
		}
	}
});