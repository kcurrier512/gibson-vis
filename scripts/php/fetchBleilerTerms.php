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
   		$query = "SELECT id, term, parentID, level, description
					FROM bleilerTerms";
		
	
	$result = mysqli_query($link,$query); 
	$nrOfRows = mysqli_num_rows($result);
	
	while (($row = mysqli_fetch_row($result)))
	{	
				$counter++;
				$array = array("bleiler_term"=> $row[1], "bleiler_id"=> $row[0], "parent_id"=> $row[2], "level"=> $row[3], "description" => $row[4]);
							$current = json_encode($array);

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