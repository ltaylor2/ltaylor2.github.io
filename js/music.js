$.get("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/album_list.txt",
function(albumListRaw) 
{

	var albumList = albumListRaw.split("\n");

	var prom_albums = [];

	for (i in albumList) {
		let album = albumList[i];
		if (album != "") {
			prom_albums.push(promiseAlbumLink(album));
		}
	}

	Promise.all(prom_albums).then(function(albumLinks) {
		let as = document.createElement("ul");
		as.id = "album-list";
		for (i in albumLinks) {
			let a = document.createElement("li");
			a.append(albumLinks[i]);
			as.append(a);
		}
		$("#music").append(as);
	});

});

function promiseAlbumLink(title) {

	let width = "100px";
	let height = "100px";
	var promise = new Promise(function(resolve) {

		var imgLink = document.createElement("A");

		var imgPath = "./Media/Album_Art/" + title + ".jpg";
		imgLink.href = imgPath;
		imgLink.target = "_blank";

		var alImg = document.createElement("img");
		alImg.classList.add("album-art");
		alImg.onerror = function() {
			alImg.src = "./Media/Album_Art/ALBUM_ERROR.jpg";
			imgLink.append(alImg);
			resolve(imgLink);
		};

		alImg.onload = function() {
			imgLink.append(alImg);
			resolve(imgLink)
		};

		alImg.alt = title;
		alImg.src = imgPath;

		alImg.style.width = width
		alImg.style.height = height;
	});

	return promise;
}