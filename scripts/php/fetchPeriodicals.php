<?php

include 'connect.php';

set_time_limit(0);

// outputs the db as lines of text.



	header('Content-type: text/plain; charset=us-ascii');
	
	$current = "[";
	echo $current;

	$counter = 0;


	mysqli_select_db($link, $database)
   		or die("unable to select database 'db': " . msql_error());
   
	
	// $query = "SELECT id, title
	// 			FROM symbol";
   		$query = "SELECT id, title, publicationPlace
					FROM journal";
		
	
	$result = mysqli_query($link,$query); 
	$nrOfRows = mysqli_num_rows($result);
	
	while (($row = mysqli_fetch_row($result)))
	{	
				$counter++;
				// $array = array("periodical_id"=> $row[0], "periodical_title"=> $row[1], "publication_place"=> $row[2]);
				// 			$current = json_encode($array);
				$current = "{\"periodical_id\":\"" . addcslashes(str_replace( '/', '\/', $row[0]), '\"') 
					. "\",\"periodical_title\":\"" . addcslashes(str_replace( '/', '\/', $row[1]), '\"') 
					. "\",\"publication_place\":\"" . addcslashes(str_replace( '/', '\/', $row[2]), '\"') 
					. "\"}";
				echo $current;


				if($counter < $nrOfRows)
				{
					$current = ",";
					echo $current;
				}
		
		//echo $row[0] . "," . $row[1] .  "," . $row[2] . "\n";	
	
	}
$current = "]";
echo $current;

//free memory
mysqli_free_result($result);

mysqli_close($link);



?>