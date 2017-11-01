
<?php
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	$files = glob('data/*.json');//scandir('data/');
	//$files = array_reverse($files);
	$count = count($files);
 	$offset = 0;
 	$num = 4;
 	if ($_GET['start']) $offset = $_GET['start'];
 	//if ($_GET['n']) $num = $_GET['n'];
	$num =  min($num,$count-$offset);
	echo('{"total":'.$count.', "start": '. $offset .', "items":'  ) ;
	echo ('['); // begin array
	// nb begin at the end of the list and count back
	for($i = $count-$offset-1; $i > $count - $offset - $num - 1 ; $i-- ){

		if ($i < $count-$offset-1) echo(','); // add a comma between elements if needed
		//echo ('{"index":'.$i.'},');
		echo file_get_contents($files[$i]);
	}
	echo (']}'); // end array

?>