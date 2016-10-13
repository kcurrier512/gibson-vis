<?php
$myFile = 'covers.json';
$fh = fopen($myFile, 'w+') or die("error opening file");
fwrite($fh, $_POST['json']);
fclose($fh);

?>