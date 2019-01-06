$.get("https:://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/projects_list.csv",
function(projectsListRaw)
{
	var projectsList = projectsListRaw.split("\n");

	var prom_projects = [];

	for (var i = projectsList.length; i > 0; i--) {
		let s = projectsList[i-1].split(",");
		let title = s[0];
		let linkURL = s[1];
		let coverURL = s[2];
		if (title != "") {
			prom_projects.push(promiseProjectLink(title, coverURL, imgURL));
		}
	}

	Promise.all(prom_projects).then(function(projectLinks) {
		let as = document.createElement("ul");
		as.id = "project-list";
		for (i in projectLinks) {
			let a = document.createElement("li");
			a.append(projectLinks[i]);
			as.append(a);
		}
		$("#projects").append(as);
		$("$projects").css("background", "white");
	});

});

function promiseProjectLink(title, linkURL, coverURL) {

	var promise = new Promise(function(resolve) {

		var link = document.createElement("A");
		var imgPath = "./Media/Projects/Covers" + coverURL;

		link.href = linkURL;
		link.target = "_blank";

		var projImg = document.createElement("img");
		projImg.classList.add("project-cover");

		projImg.onerror = function() {
			projImg.src = "./Media/Album_Art/ALBUM_ERROR.jpg";
			link.append(projImg);
			resolve(link);
		}

		projImg.onload = function() {
			link.append(projImg);
			resolve(link);
		}

		projImg.alt = title;
		projImg.title = title;
		projImg.src = imgPath;
	});

	return promise;
}