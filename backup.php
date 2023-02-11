
<?php
define("BACKUP_PATH", "backup"); 
define("MAX_BACKUPS_COUNT", 10); 

date_default_timezone_set('Europe/Prague');

header('Content-Type','application/json; charset=utf-8');
error_reporting(1);
$data = json_decode(file_get_contents("php://input"));

if($data->requestId == "upload") {
  $pages = $data->pages;
  if(!isset($pages) || empty($pages)) {
    die;
  }
  $res = file_put_contents(BACKUP_PATH."/".date('m-d-Y_H-i-s').".json", json_encode($pages));

  $backups =  array_values(array_diff(scandir(BACKUP_PATH, SCANDIR_SORT_ASCENDING), array('..', '.')));
  $overLimit =  count($backups) - MAX_BACKUPS_COUNT;
   
  for ($i=0; $i < $overLimit; ++$i) { 
    unlink(BACKUP_PATH."/".$backups[$i]);
  }

  echo json_encode("Záloha vytvořena.");
}

if($data->requestId == "download") {
  $path = BACKUP_PATH."/".$data->filename;
  if(!file_exists($path)) {
    throw json_encode("Záloha ".$data->filename." neexistuje.");
    die;
  }
  echo file_get_contents($path);
}


if($data->requestId == "list") {
  echo json_encode(array_diff(scandir(BACKUP_PATH), array('..', '.')));
}
