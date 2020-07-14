<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT");
header("Access-Control-Allow-Headers: Content-Type");


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


//-------------------------          uploadSmallPageImages   -------------------------
function uploadSmallPageImages(){
    $maxFileSize    = 21000000;
    $imageFileType  = strtolower(pathinfo($_FILES["smalldesigns"]["name"],PATHINFO_EXTENSION));
    $messages       = null;
    $target_dir     = "smalldesigns/";
    $target_file    = $target_dir . uniqid().'.'.$imageFileType;
    $uploadOk       = 1;
    
    
    
    // Check file size
    if ($_FILES["smalldesigns"]["size"] > $maxFileSize) {
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
        if (move_uploaded_file($_FILES["smalldesigns"]["tmp_name"], $target_file)) {
            echo json_encode(['url'=>'api/'.$target_file]);
        } else {
            echo json_encode(['error'=>"Sorry, there was an error uploading your file."]);
        }
    }
}


//-------------------------          uploadSmallPageImages   -------------------------
function saveSablonToServer(){
    $maxFileSize    = 21000000;
    $imageFileType  = strtolower(pathinfo($_FILES["sablonfile"]["name"],PATHINFO_EXTENSION));
    $messages       = null;
    $target_dir     = "sablons/";
    $target_file    = $target_dir . $_FILES["sablonfile"]["name"];
    $uploadOk       = 1;
    
    
    
    // Check file size
    if ($_FILES["sablonfile"]["size"] > $maxFileSize) {
        $messages .= "\nDosya boyutu çok büyük! Max. 20 MB olabilir";
        $uploadOk   = 0;
    }
    
    // Allow certain file formats
    if($imageFileType != "json") {
        $messages  .= "\nDosya formatı sadece JSON";
        $uploadOk   = 0;
    }
    


    header('Content-Type: application/json');
    if ($uploadOk == 0) {
        echo json_encode(['messages'=>$messages]);
    } else {
        if (move_uploaded_file($_FILES["sablonfile"]["tmp_name"], $target_file)) {
            echo json_encode(['url'=>'api/'.$target_file]);
        } else {
            echo json_encode(['error'=>"Sorry, there was an error uploading your file."]);
        }
    }
}

//-------------------------          getFontList   -------------------------
function getFontList(){
    global  $json_header;
    $fontsDir    = "../editor/fonts";
    $files      = scandir($fontsDir);
    $list       = new stdClass(); 
    foreach($files as $fval){
        if($fval!='.'){
            $path = $fontsDir.'/'.$fval;
            if(is_dir($path)){
                //$list[] = ['type'=>'folder' ,'path'=>$path  ,'name'=>$fval];
            }else{
                $ext = pathinfo($fval);
                if($ext['extension']=='ttf'){
                    $list->{$ext['filename']} = $ext['filename'];
                }
            }
        }
    }

    header('Content-Type: application/json');
    echo json_encode($list);
}



///////////////////////////////////////////////////////////////////////////////////
//----------------------------------   MAIN    -----------------------------
if($command == "getBgImages"){
    getBgImages();
}else if($command == "uploadUserImage"){
    uploadUserImage();

}else if($command == "uploadSmallPageImages"){
    uploadSmallPageImages();
}else if($command == "saveSablonToServer"){
    saveSablonToServer();
}else if($command == "getFontList"){
    getFontList();
}