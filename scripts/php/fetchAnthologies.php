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
   		$query = "SELECT item.id, item.title, item.year, item.bleilerIDs, anthology.title, person.fullName, anthology.id, item.journalID
				FROM item, anthology, person, itemContributor
				WHERE anthology.id = item.anthologyID AND item.id = itemContributor.itemID AND itemContributor.personID = person.id";
		

	
	$result = mysqli_query($link,$query); 
	if(!$result){
		die(mysqli_error($link));
	}
	$nrOfRows = mysqli_num_rows($result);
	
	while (($row = mysqli_fetch_row($result)))
	{	
				$counter++;
				//$array = array("story_title"=> $row[1], "story_id"=> $row[0], "story_year"=> $row[2], "story_terms"=> $row[3], "author"=> $row[5], "anthology"=> $row[4]);
				//$current = json_encode($array, JSON_UNESCAPED_UNICODE);
				$current = "{\"story_title\":\"" . addcslashes(str_replace( '/', '\/', $row[1]), '\"') 
					. "\",\"story_id\":\"" . addcslashes(str_replace( '/', '\/', $row[0]), '\"') 
					. "\",\"story_year\":\"" . addcslashes(str_replace( '/', '\/', $row[2]), '\"') 
					.  "\",\"story_terms\":\"" . addcslashes(str_replace( '/', '\/', $row[3]), '\"') 
					. "\",\"author\":\"" . addcslashes(str_replace( '/', '\/', $row[5]), '\"') 
					. "\",\"periodical\":\"" . addcslashes(str_replace( '/', '\/', $row[7]), '\"') 
					. "\",\"anthology\":\"" . addcslashes(str_replace( '/', '\/', $row[4]), '\"') 
					. "\",\"anthology_id\":\"" . addcslashes(str_replace( '/', '\/', $row[6]), '\"') 
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