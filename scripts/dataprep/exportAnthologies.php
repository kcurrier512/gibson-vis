<?php

echo $_SERVER['REQUEST_METHOD'];

$myFile = 'anthologies.json';
echo $_POST["json"];
//$val = isset($_POST['json'] ? $_POST['json'] : 'empty';
//$val = $_POST['data'];
$fh = fopen($myFile, 'w') or die("error opening file");
//fwrite($fh, $val);
fwrite($fh, print_r($_POST["json"], true));
fclose($fh);

?>