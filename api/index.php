<?php
$command        = $_GET['command'];



//-------------------------          getBgImages  -------------------------
function getBgImages(){
    global  $json_header;
    $bgimagesdir    = "bgimages";
    $folder         = isset($_GET['folder'])?$_GET['folder']:null;

    if($folder != '/'){
        $bgimagesdir = $folder ;
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

    header('Content-Type: application/json');
    echo json_encode($list);
}




//-------------------------          getBgImages   -------------------------
function uploadUserImage(){
    $maxFileSize    = 21000000;
    $imageFileType  = strtolower(pathinfo($_FILES["userimage"]["name"],PATHINFO_EXTENSION));
    $messages       = null;
    $target_dir     = "userimages/";
    $target_file    = $target_dir . uniqid().'.'.$imageFileType;
    $uploadOk       = 1;
    
    
    
    // Check file size
    if ($_FILES["userimage"]["size"] > $maxFileSize) {
        $messages .= "\nDosya boyutu çok büyük! Max. 20 MB olabilir";
        $uploadOk   = 0;
    }
    
    // Allow certain file formats
    if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg") {
        $messages  .= "\nDosya formatı sadece JPG, JPEG, PNG olmalı";
        $uploadOk   = 0;
    }
    


    header('Content-Type: application/json');
    if ($uploadOk == 0) {
        echo json_encode(['messages'=>$messages]);
    } else {
        if (move_uploaded_file($_FILES["userimage"]["tmp_name"], $target_file)) {
            echo json_encode(['url'=>'api/'.$target_file]);
        } else {
            echo json_encode(['error'=>"Sorry, there was an error uploading your file."]);
        }
    }
}









///////////////////////////////////////////////////////////////////////////////////
//----------------------------------   MAIN    -----------------------------
if($command == "getBgImages"){
    getBgImages();
}else if($command == "uploadUserImage"){
    uploadUserImage();
}