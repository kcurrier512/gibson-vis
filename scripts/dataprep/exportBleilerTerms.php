<?php
$myFile = 'bleiler.json';
echo (file($myFile)[0]);
$fh = fopen($myFile, 'w') or die("error opening file");
//fwrite($fh, $_POST["json"]);
fwrite($fh, print_r($_POST["json"], true));
echo file($myFile);
fclose($fh);

?>