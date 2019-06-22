<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8"/>

	<link href="css/style.css" type="text/css" rel="stylesheet">
	<script src="https://code.jquery.com/jquery-latest.min.js"></script>

</head>

<body>

	<div id="load-header">
	</div>
	<script type="text/javascript">
		$("#load-header").load("https://ltaylor2.github.io/index.html #header",
			function() {
				var links = document.getElementsByClassName("menu-item");
				for (var l = 0; l < links.length; l++) {
					links[l].classList.remove("menu-item-active");
				}

				var activeLinkName = "rl-link";
				var activeLink = document.getElementById(activeLinkName);
				activeLink.classList.add("menu-item-active");
		});
	</script>

	<div id="papers-parent">
		<p id="papers-header">Papers</p>
		<div id="papers">
	</div>
	</div>
	<div id="media-parent">
		<p id="music-header">Music</p>
		<div id="music">
		</div>
		<p id="books-header">Books</p>
		<div id="books">
		</div>
		</div>
	</div>

	<script src="js/papers.js" type="text/javascript"></script>
	<script src="js/music.js" type="text/javascript"></script>
	<script src="js/books.js" type="text/javascript"></script>

</body>
</html>