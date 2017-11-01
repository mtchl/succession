<?php

	$data = file_get_contents("php://input");

	$payload = json_decode($data);

	$id = $payload->id;

	$imagedata = $payload->imageData;
	//echo ('image data len '. strlen($imagedata));

	//echo (strlen($_POST["imageData"]));
    // Extract base64 data
    // we have an unneeded header, zap it
    $parts = explode(',', $imagedata);  
    $data = $parts[1];  
    // Decode
    $data = base64_decode($data);  
    // Save
    $fp = fopen('images/'.$id.'.png', 'w');  
    fwrite($fp, $data);  
    fclose($fp);

    unset($payload->imageData); // unset the image data, leaving just the metadata

	$datawrite = file_put_contents("data/".$id.".json",json_encode($payload));
	echo "wrote file data ". $datawrite  ."bytes \n";



?>