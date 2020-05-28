<?php
$bgimagesdir    = "bgimages";
$folder         = $_GET['folder'];
$json_header    = header('Content-Type: application/json');
$command        = $_GET['command'];



//-----------------------------   GET BG IMAGES   ----------------------
if($command == "getBgImages"){
    if($folder!='/'){
        $bgimagesdir = $folder;
    }
    $files      = scandir($bgimagesdir);
    $list       = [];
    foreach($files as $fval){
        if($fval!='.'){
            $path = $bgimagesdir.'/'.$fval;
            if(is_dir($path)){
                $list[] = ['type'=>'folder' ,'path'=>$path  ,'name'=>$fval];
            }else{
                $list[] = ['type'=>'file'   ,'path'=>$path  ,'name'=>$fval];
            }
        }
    }

    echo $json_header;
    echo json_encode($list);
}