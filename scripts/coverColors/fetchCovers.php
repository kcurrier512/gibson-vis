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
   		$query = "SELECT coverURL, coverLowResURL, iconURL
					FROM anthology";
		

	
	$result = mysqli_query($link,$query); 
	if(!$result){
		die(mysqli_error($link));
	}
	$nrOfRows = mysqli_num_rows($result);
	
	while (($row = mysqli_fetch_row($result)))
	{	
				$counter++;
				$array = array("coverUrl"=> $row[0], "coverLowResURL"=> $row[1], "iconURL"=> $row[2]);
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