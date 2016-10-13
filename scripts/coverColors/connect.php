<?php

$username="jbrosz";
$password="42xyfa!";
$database="gibson";
$host = "localhost";

$link=mysqli_connect($host, $username, $password);

if (!$link)
    die("Unable to connect to DB [".$link->connect_error."]");
?>