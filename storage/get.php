<?php
	 header("Access-Control-Allow-Origin: *");
	 header('Content-Type: application/json');
	$fname = 'data/'.$_GET['id'] . '.json';
	echo file_get_contents($fname);
?>