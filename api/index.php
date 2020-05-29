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
                $ext = pathinfo($fval, PATHINFO_EXTENSION);
                if(in_array($ext,['jpg','png','svg','jpeg'])){
                    $list[] = ['type'=>'file'   ,'path'=>$path  ,'name'=>$fval];
                }
            }
        }
    }

    echo $json_header;
    echo json_encode($list);
}