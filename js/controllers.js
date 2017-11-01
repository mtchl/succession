var successionControllers = angular.module('successionControllers', ['ngAnimate']);

successionControllers.controller('CompositorCtrl', ['$scope','$rootScope','$routeParams','$location','$timeout','$http', 
	function($scope,$rootScope,$routeParams,$location,$timeout,$http){

	 	
	$scope.baseURL = "http://mtchl.net/succession";

	$scope.showInfo	= true;
	$scope.showCanvas = true;
	$scope.loadindex = 0;

	$scope.canvasW = 1000;
	$scope.canvasH = 700;

	$scope.works = [];
	$scope.drawlist = [];
	$scope.ownerMap = {
		"126377022@N07": "Internet Archive",
		"29295370@N07": "Tyne and Wear Archives and Museums",
		"33147718@N05": "Australian National Maritime Museum",
		"8623220@N02" : "Library of Congress",
		"31575009@N05" : "UK National Archives",
		"12403504@N02" : "British Library",
		"11334970@N05" : "UK National Maritime Museum",
		"26808453@N03" : "National Media Museum",
		"41131493@N06" : "SMU Central University Library",
		"27331537@N06" : "State Records NSW",
		"32300107@N06" : "Imperial War Museum Collections",
		"24785917@N03" : "Powerhouse Museum"
	}

	 $scope.fadeOutDuration = 4000;

	$scope.loadFlickr = function(){
		//console.log("loading flickr metadata");
		$http.get("data/flickr.json").success(function(data){
			$scope.works = data;
			//console.log("loaded " + $scope.works.length + " items");
			$scope.batchDisplay();
		});
	}


	$scope.batchDisplay = function(){ // draw a batch of images in one go
		$scope.showCanvas = true;
		var ctx = document.getElementById('cvs').getContext('2d');
		ctx.clearRect(0,0,$scope.canvasW,$scope.canvasH);
		$scope.drawlist = [];
		$scope.drawData = []; // store the drawing data
		//console.log("new composite");
		$scope.beginDraw(0); 
		$scope.compositeStatus = "loading";

	}

	// https://c2.staticflickr.com/8/7142/6521117945_d603bcda4f_b.jpg
	// https://c2.staticflickr.com/8/7458/13942367008_75248f4c64_b.jpg

	$scope.beginDraw = function(idx){
		$scope.loadindex = idx;
		//console.log("drawing " + $scope.loadindex);
		var rnd1 = Math.floor(Math.random()*$scope.works.length);
		var rwork = $scope.works[rnd1];	// pick a random item from the loaded set
		// update the list of item attribution / titles
		//rwork.thumb = "https://c2.staticflickr.com/"+rwork.farm+"/"+rwork.server+"/"+rwork.id+"_"+rwork.secret+"_n.jpg"; // URL to thumbnail
		//rwork.thumb = "https://farm"+rwork.farm+".staticflickr.com/"+rwork.server+"/"+rwork.id+"_"+rwork.secret+"_n.jpg"; // URL to thumbnail

		rwork.thumb = "img/sources/" + rwork.id + "-thumb.jpg";

		$scope.drawlist.push(rwork);
		//console.log("drawing " + idx + " : " + rwork.title);
		// work out the owner of the item //
		var owner = "twam";
		if (rwork.owner == "126377022@N07") owner = "ia"; // from internet archive - a book image
		//var path = "https://farm"+rwork.farm+".staticflickr.com/"+rwork.server+"/"+rwork.id+"_"+rwork.secret+"_b.jpg";
		//var path ="https://c2.staticflickr.com/"+rwork.farm+"/"+rwork.server+"/"+rwork.id+"_"+rwork.secret+"_b.jpg"; // URL to large
		path = "img/sources/" + rwork.id + ".jpg";
		
		$scope.drawData.push({'flickr':rwork}); // store the flickr data in the drawlist

		$scope.drawCanvas(path,owner,idx,function(){ 

			if (idx < 4) { // draw the next layer
				$scope.beginDraw(idx+1);
				$scope.$apply();
			} else { // finished, reveal the canvas;
				$scope.showCanvas = true;
				$scope.compositeStatus = "loaded";
				$scope.$apply();
			}
		});
	}


	$scope.drawCanvas = function(imgPath,owner,index,callback){
		var ctx = document.getElementById('cvs').getContext('2d');
		var img = new Image();
		$scope.drawData[index].draw = []; // new array to store drawing info
		var proxy = false;

		img.onload = function(){
			ctx.globalCompositeOperation = 'normal';
			ctx.globalAlpha = 0.4;
			
			if (owner != "ia"){

			var dice = Math.random();
				
				if (dice < 0.2) {
					ctx.globalCompositeOperation = 'multiply';
					ctx.globalAlpha = 0.6;
				}
				else if (dice > 0.6) {
					ctx.globalCompositeOperation = 'darken';
					ctx.globalAlpha = 0.6;
				}

				else if (dice > 0.8) {
					ctx.globalCompositeOperation = 'lighter';
					ctx.globalAlpha = 0.6;
				}
			}

			if (owner == "ia"){

				var dice = Math.random();
				if (dice < 0.7) {
					ctx.globalCompositeOperation = 'multiply';
					ctx.globalAlpha = 0.6;
					//console.log("ia image multiply");
				} else {
					ctx.globalCompositeOperation = 'exclusion';
					ctx.globalAlpha = 0.6;
					//console.log("ia image difference");
				}

			}						

			if (index == 0){			// first image is drawn full frame, full opacity
				ctx.globalCompositeOperation = 'normal';
				ctx.globalAlpha = 1.0;
				singleImageContain(img,$scope.drawData[index].draw);
			} else {
				var modedice = Math.random();
				if (modedice < 0.3){ // single image scale 1-5;
					singleImageFloating(img,$scope.drawData[index].draw);
				} else if (modedice < 0.8){ // single image fill, keep aspect ratio
					singleImageContain(img,$scope.drawData[index].draw);
				} else { // draw a strip of small imgs
					drawStrip(img,$scope.drawData[index].draw);
				}
			}

			if ($scope.drawData[index].draw.length == 0) console.log("no draw data for " + img.src);
			
			if (callback) callback(); // if it exists, call the callback so we know when the image has loaded
		}

		img.onerror= function(){
			$scope.compositeStatus = "error";
			$scope.$apply();
		} 

		img.src = imgPath;
		// if (proxy) {
		// 	img.src = $scope.baseURL + "/proxy.php?url=" + encodeURI(imgPath);
		// } else img.src = imgPath;

		function singleImageContain(img,drawlog){
			xoffset = 0;
			yoffset = 0;
			sc = 1;
			if (img.width > img.height){ // wide
				sc = 700/img.height; // scale so that height fills the frame
				xoffset = Math.floor( 0.5*($scope.canvasW - (img.width*sc))); // x offset
			} else { // tall
				sc = $scope.canvasW/img.width;
				yoffset = Math.floor(0.5*($scope.canvasH - (img.height*sc))); //;
			} 
			iw = Math.floor(img.width*sc);
			ih = Math.floor(img.height*sc);
			ctx.drawImage(img,xoffset,yoffset,iw,ih);
			drawlog.push({'src':img.src,'xp':xoffset,'yp':yoffset,'w':iw,'h':ih, 'comp': ctx.globalCompositeOperation,'alpha':ctx.globalAlpha});	

		}

		function singleImageFloating(img,drawlog){
			var sc = 0.2*(1 + Math.random()*8);
			//var xp = (((img.width*sc*2))*Math.random())-500;
			var xp = Math.floor(Math.random()*($scope.canvasW - (img.width*sc))); // stay in canvas
			//var yp = (((img.height*sc*2))*Math.random())-300;
			var yp = Math.floor(Math.random()*($scope.canvasH - (img.height*sc))); // stay in canvas
			//imgFadeIn(ctx,img,xp,yp,img.width*sc,img.height*sc,0.5);
			iw = Math.floor(img.width*sc);
			ih = Math.floor(img.height*sc);
			ctx.drawImage(img,xp,yp,iw,ih);
			drawlog.push({'src':img.src,'xp':xp,'yp':yp,'w':iw,'h':ih,'comp': ctx.globalCompositeOperation,'alpha':ctx.globalAlpha});
		}

		function drawStrip(img,drawlog){
			var isc = 0.1 + 0.2*Math.random(); 

			var rx = 50 + Math.floor(Math.random()*($scope.canvasW*0.9)); // strip location
			var ry = 50 + Math.floor(Math.random()*($scope.canvasH-100)); // strip location
			var st = Math.floor(Math.random()*3); // start offset
			var num = Math.floor(3 + Math.random()*6); // number of tiles
			var pad = 5 + Math.floor(Math.random()*80); // padding between tiles
			var flip = Math.random(); // vertical or horizontal
			iw = Math.floor(img.width*isc);
			ih = Math.floor(img.height*isc);
			//console.log("strip: scale " + iw);
			for (var i=st; i<num; i++){
				if (flip < 0.5){
					ctx.drawImage(img,rx,i*(ih+pad),iw,ih);
					drawlog.push({'src':img.src,'xp':rx,'yp':i*(ih+pad),'w':iw,'h':ih,'comp': ctx.globalCompositeOperation,'alpha':ctx.globalAlpha});
				} else {
					ctx.drawImage(img,i*(iw+pad),ry,iw,ih);
				drawlog.push({'src':img.src,'xp':i*(iw+pad),'yp':ry,'w':iw,'h':ih,'comp': ctx.globalCompositeOperation,'alpha':ctx.globalAlpha});
				}
			}
		}

		}

		$scope.resumePlaying = function(){
			//console.log("resuming");
			$scope.showCanvas = false;
			$timeout( function(){ 
				$scope.batchDisplay(); // retrigger the batch	
			 }, $scope.fadeOutDuration);
		}

		$scope.togglePauseButton = function(){
			if (!$scope.playing) $scope.resumePlaying(); // trigger the resume if necessary
			$scope.playing = !$scope.playing;
			console.log("playing: " + $scope.playing);
		}

		$scope.postData = function(){
			console.log("posting");
			var timestamp = Date.now();
			var canvasData = document.getElementById('cvs').toDataURL(); // get the canvas data
			var pk = {'id': timestamp, 'drawData': $scope.drawData, 'imageData':canvasData};

			//console.log(canvasData);
			$http.post($scope.baseURL + '/storage/storage.php', pk).success(function(data){
				console.log("response: " + data);
				$rootScope.$emit("save");
				$location.path("/saved/"+timestamp);
			});
		}


		$scope.loadFlickr();

		

	}
]);


/* saved list controller */

successionControllers.controller('SavedListCtrl', ['$scope','$http','$rootScope',
	function($scope,$http,$rootScope){
	
		$scope.offset = 0;
		$scope.baseURL = "http://mtchl.net/succession";

		$scope.loadList = function(newoffset){

			if (newoffset > $scope.totalSaved || newoffset < 0) return; // past the end

			//console.log("loading data from " + newoffset);

			$scope.offset = newoffset;

			//console.log("loading saved files from " + $scope.baseURL + "/storage/list.php?start="+$scope.offset);

			$http.get($scope.baseURL + "/storage/list.php?start="+$scope.offset).success(function(data){
				//console.log("loading saved files from " + $scope.baseURL + "/storage/list.php?start="+$scope.offset);
				$scope.errorMsg = "";
				$scope.totalSaved = data.total;
				$scope.list = data.items;
				$scope.list.forEach(function(i,x){ // build nice dates
					var d =  new Date(i.id);
					i.dateString = d.toDateString();
					i.idx = +x+$scope.offset;
				});
			}).error(function(){
				console.log("Could not load saved composite data");
			});
		}

		$scope.loadList($scope.offset);

		$scope.saveImageOnly = function(itemData,idx){ // for saving existing composites
			console.log("saving image for item " + itemData.id);
			var canvasData = document.getElementById('savedcvs'+idx).toDataURL(); // get the canvas data
			var pk = {'id': itemData.id, 'drawData': itemData.drawData, 'imageData':canvasData};
			$http.post($scope.baseURL + '/storage/storage.php', pk).success(function(data){
				console.log("response: " + data);
				//$rootScope.$emit("save");
				//$location.path("/saved/"+timestamp);
			});
		};

		$rootScope.$on('save', function() {
			//console.log("got save message, reloading");
      		$scope.loadList(0);
    	});

	}
]);


/* saved item controller */

successionControllers.controller('SavedItemCtrl', ['$scope','$routeParams','$http','$rootScope',
	function($scope,$routeParams,$http,$rootScope){

		$scope.baseURL = "http://mtchl.net/succession";;

		$scope.loading = true;

		$scope.ownerMap = {
			"126377022@N07": "Internet Archive",
			"29295370@N07": "Tyne and Wear Archives and Museums",
			"33147718@N05": "Australian National Maritime Museum",
			"8623220@N02" : "Library of Congress",
			"31575009@N05" : "UK National Archives",
			"12403504@N02" : "British Library",
			"11334970@N05" : "UK National Maritime Museum",
			"26808453@N03" : "National Media Museum",
			"41131493@N06" : "SMU Central University Library",
			"27331537@N06" : "State Records NSW",
			"32300107@N06" : "Imperial War Museum Collections",
			"24785917@N03" : "Powerhouse Museum"
		};
	
		$scope.itemID = $routeParams.itemID;
		$http.get($scope.baseURL + "/storage/get.php?id=" + $scope.itemID ).success(function(data){
			
			//$http.get("http://mtchl.net/succession/storage/data/" + $scope.itemID + ".json").success(function(data){
			//console.log("loading from " + "http://mtchl.net/succession/storage/data/" + $scope.itemID + ".json");
			
			data.drawData.forEach(function(i){
				//i.flickr.thumb = "https://farm"+i.flickr.farm+".staticflickr.com/"+i.flickr.server+"/"+i.flickr.id+"_"+i.flickr.secret+"_n.jpg"; // URL to thumbnail
				i.flickr.thumb = "img/sources/" + i.flickr.id + "-thumb.jpg";
			});
			$scope.item = data;	
			console.log($scope.item);
			

			var savedimg = new Image();
			savedimg.onload = function(){
				console.log("loaded saved image");
				$scope.loading = false;
				$scope.$apply();
			}

			savedimg.src = $scope.baseURL + "/storage/images/" + $scope.itemID + ".png";

		}).error(function(data){
			//$scope.loadStatus = "error loading!";
		});
		
		/*
		$scope.saveImageOnly = function(itemData,idx){ // for saving existing composites
			console.log("saving image");
			var canvasData = document.getElementById('savedcvs'+idx).toDataURL(); // get the canvas data
			var pk = {'id': itemData.id, 'drawData': itemData.drawData, 'imageData':canvasData};
			$http.post($scope.baseURL + '/storage/storage.php', pk).success(function(data){
				console.log("response: " + data);
				//$rootScope.$emit("save");
				//$location.path("/saved/"+timestamp);
			});
		};
		*/
	}
]);


/*
successionControllers.controller('futureGenCtrl',['$scope', '$interval','$http', 
	function($scope, $interval, $http){

		$scope.statement = [['A'], [], [], [], []];

	$http.get("data/vocab.json").success(function(data){
		$scope.futureWords = data;
		$scope.generator();
		$interval(function(){ $scope.changeOne() }, 10000);
	});



	$scope.generator = function(){
		var ra = getNewRandomItem($scope.futureWords.adjectives,$scope.statement[1][0]);
		var rn = getNewRandomItem($scope.futureWords.nouns,$scope.statement[2][0]);
		var rv = getNewRandomItem($scope.futureWords.verbs,$scope.statement[3][0]);
		var ro = getNewRandomItem($scope.futureWords.objects,$scope.statement[4][0]);
		$scope.statement = [['A'], [ra], [rn], [rv], [ro]];
		if (ra.substring(0,1).search(/[aeiou]/) > -1) $scope.statement[0] = ['An'];
		$scope.changeOne();
	}

	$scope.changeOne = function(){
		var bitnames = ["adjectives","nouns","verbs","objects"];
		var randombit = Math.floor(Math.random()*4);
		var newtext = getNewRandomItem(  $scope.futureWords[bitnames[randombit]],$scope.statement[randombit+1][0]);
		if (randombit == 0) checkArticle(newtext);
		$scope.statement[randombit+1].push(newtext); // = [newtext];
		$scope.statement[randombit+1].shift();

	}

	$scope.changeThis = function(bitIndex){
		if (bitIndex < 0) return;
		var bitnames = ["adjectives","nouns","verbs","objects"];
		var newtext  = getNewRandomItem($scope.futureWords[bitnames[bitIndex]],$scope.statement[bitIndex+1][0]);
		$scope.statement[bitIndex+1].push(newtext);
		$scope.statement[bitIndex+1].shift();
		if (bitIndex == 0) checkArticle(newtext);
	}



	function checkArticle(newtext){
		if (newtext.substring(0,1).search(/[aeiou]/) > -1 && $scope.statement[0] == 'A'){
				$scope.statement[0].push('An'); // = [newtext];
				$scope.statement[0].shift();
			} else if (newtext.substring(0,1).search(/[aeiou]/) == -1 && $scope.statement[0] == 'An'){
				$scope.statement[0].push('A'); // = [newtext];
				$scope.statement[0].shift();
			}
	}


	$scope.getElementWidth = function(str){
		var dummy = document.getElementById('dummyTextBit'); //createElement('span');
		dummy.textContent = str;
		var w = dummy.offsetWidth;
		return w;
	}

	function getRandomItem(array){
		var idx = Math.floor(Math.random()*(array.length));
		return array[idx];
	}

	function getNewRandomItem(array, lastvalue){
		var idx = Math.floor(Math.random()*(array.length));
		if (array[idx] != lastvalue) return array[idx];
		else while (array[idx] == lastvalue){
			idx = Math.floor(Math.random()*(array.length));
		}
		return array[idx];
	}

}]);

*/





	