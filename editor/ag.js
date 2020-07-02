var agBaseURL       = "http://opencart.test"
var agEditor;
var ag_gorev        = '' // bg-ekle | logo-ekle
var ag_product_id   = null;

$('document').ready(  function(){

    agEditor        = new AgEditor();
    
    if(!ifExistProductIdinUrl()){
        $(agEditor.nav_html_element).hide();
        $(agEditor.target_properties_panel).hide(); 
        return;
    }

    ocFrontPage_ifProductPage();

    getSablonFile()

    agEditor.refreshMainMenu()

    $('[data-toggle="tooltip"]').tooltip()
    
    $('#ag-yeni').click(function(){
        $('#modal-yeni').modal();
    })

    $('#bg-ekle').click(function(){
        ag_gorev = 'bg-ekle'
        openImageBrowser('/');
    })

    $('#textarea-ekle').click(function(){
        agEditor.addTextArea();
    })

    $('#croparea-ekle').click(function(){
        agEditor.addCropArea();
    })

    $('#logo-ekle').click(function(){
        ag_gorev = 'logo-ekle'
        openImageBrowser('/');
    })

    $('#canvas-ekle').click(function(){
        agEditor.addCanvas();
    })

    $('#obje-sil').click(function(){
        agEditor.removeObject();
    })

    $('#saveJsonToLocal').click(function(){
        agEditor.saveJsonToLocal();
    })

    $('#openJsonFromLocal').click(async function(){

        $('#tmp_file_input').remove();
        let fileslct    = document.createElement("INPUT");
        fileslct.id     ="tmp_file_input";
        fileslct.setAttribute("style","display:none");
        fileslct.setAttribute("type", "file");
        $('body').append(fileslct);
        fileslct.click();

        return new Promise((resolve,reject)=>{
            $(fileslct).change(function(){                
                let file        = $(this)[0].files[0]
                let reader      = new FileReader();
                reader.readAsText(file);
                reader.onload   = async function() {
                    await agEditor._fromJSON(JSON.parse(reader.result));
                    resolve();
                };
                reader.onerror  = function() {
                    console.error(reader.error);
                    reject();
                };
            })
        })
    })

    $('#sendBackwards').click(function(){ 
        if(!agEditor.activeCanvas)return;
        let index = agEditor.activeCanvas.getObjects().indexOf(agEditor.activeCanvas.getActiveObject())
        if(index>0){
            agEditor.activeCanvas.sendBackwards(agEditor.activeCanvas.getActiveObject())
        }
    })
    
    $('#bringForward').click(function(){ 
        if(!agEditor.activeCanvas)return;
        agEditor.activeCanvas.bringForward(agEditor.activeCanvas.getActiveObject())
    })
    
    $('#sunumuBaslat').click(function(){
        agEditor.sunumuBaslat();
    })  
    
    $('#renderWithBigBGImage').click(function(){
        agEditor.renderWithBigBGImage();
    }) 

    $('#downloadBigImage').click(function(){
        agEditor.downloadBigImage();
    }) 
    
    $('.modal-body').on('click','.img-thumbnail',function(){
        folder = $(this).attr('data-path')
        if(folder != undefined){
            openImageBrowser(folder);
        }else{
            imgElm = $(this).find('img');
            if(ag_gorev == "bg-ekle"){
                agEditor.setPageBgImage(imgElm);
                $('#modal-kutuphane').modal('hide');
            }else if(ag_gorev == "logo-ekle"){
                agEditor.addLogo(imgElm);
            }
        }
    })

    $('body').on('change','.prop-form-control',function(){
        prop_name   = $(this).attr('data-prop-name');
        value       = $(this).val();
        if(prop_name == "fontFamily"){
            let name = $(this).find('option:selected').text();
            value = {"name":name,"font_file":value}
        }
        agEditor.setObjectProperties(prop_name,value);
    })

    $('body').on('click','.ag-checkbox',function(){ 
        prop_name   = $(this).attr('data-prop-name');
        value       = $(this).is(':checked')?1:0;
        agEditor.setObjectProperties(prop_name,value);
    }) 

    $(document).on('keypress','.ag-textarea',function(event){
        let text        = $(this).val();
        let textarea    = $(this)
        let numberOfLines = (text.match(/\n/g) || []).length + 1
        let maxRows = parseInt(textarea.attr('rows'));
        if (event.which === 13 && numberOfLines === maxRows ) {
          return false;
        }
        if (numberOfLines > maxRows ) {
            return false;
        }

    })

    $(document).on('keyup','.ag-textarea',function(e){
        let target_id   = $(this).attr('data-target-id') 
        agEditor.writeToText(target_id,$(this).val())
    })

    $(document).on('keyup','.ag-textbox',function(e){
        let target_id   = $(this).attr('data-target-id') 
        let fbTxtObj    = agEditor.getObjectByID(target_id)
        let text        = $(this).val(); 

        if(fbTxtObj.agFontSize==0 || fbTxtObj.agFontSize == undefined){
            fbTxtObj.agFontSize = fbTxtObj.fontSize;
        }

        let satirBoyu = fbTxtObj.getMeasuringContext().measureText(text+"mm").width * fbTxtObj.fontSize / fbTxtObj.CACHE_FONT_SIZE;
        let degisimOrani = fbTxtObj.getScaledWidth()/satirBoyu

        if(satirBoyu >= fbTxtObj.getScaledWidth() && !fbTxtObj.agKutuyaSigdir ){ 
            text = text.substring(0,text.length-1) 
        }       

        if(fbTxtObj.agKutuyaSigdir){ 
            fbTxtObj.fontSize *= degisimOrani 
            if(fbTxtObj.fontSize>fbTxtObj.agFontSize){
                fbTxtObj.fontSize = fbTxtObj.agFontSize
            }
        }

        $(this).val(text)
        agEditor.writeToText(target_id,text)
    })

    $(document).on('keypress','.ag-textbox',function(e){
        let target_id   = $(this).attr('data-target-id') 
        let fbTxtObj    = agEditor.getObjectByID(target_id)
        let text        = $(this).val();
        if(fbTxtObj.agKarakterLimiti <= text.length){
            return false;
        }
    })    

    $(document).on('click','.ag-resimekle-btn',function(){
        let target_id                   = $(this).attr('data-target-id')
        agEditor.agCropper.targetObj    = agEditor.getObjectByID(target_id)
        agEditor.agCropper.show()
        agEditor.agCropper.showMyImages()
        if(agEditor.agCropper.targetObj.agImageUrl){
            agEditor.agCropper.agImageUrl       = agEditor.agCropper.targetObj.agImageUrl;
            agEditor.agCropper.imageBase64Data  = null;
            agEditor.agCropper.openForCrop();
            $(agEditor.agCropper.modal_element).find(".ag-crop-resim-resimlerim").show();
            $(agEditor.agCropper.modal_element).find(".ag-crop-resim-yukle").hide();
        }
    })

    $(document).on('click','.ag-crop-resim-resimlerim',function(){ 
        agEditor.agCropper.showMyImages()
        $(agEditor.agCropper.modal_element).find(".crop-menu-item").hide();

        $(agEditor.agCropper.modal_element).find(".ag-crop-resim-resimlerim").hide();
        $(agEditor.agCropper.modal_element).find(".ag-crop-resim-yukle").show();
    })

    $(document).on('click','.ag-crop-resim-yukle',()=>{
        let formData    = new FormData();
        let file_input  = document.createElement("INPUT");
        file_input.setAttribute("type", "file");
        file_input.setAttribute("accept", "image/x-png,image/gif,image/jpeg");
        
        $(file_input).on('change',(inpt)=>{
            agEditor.modal_progress.modal('show')
            let file = $(inpt)[0].currentTarget.files[0];
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function() {
                agEditor.agCropper.imageBase64Data = reader.result; 
                agEditor.agCropper.openForCrop();
                agEditor.modal_progress.modal('hide')
            };
            reader.onerror = function() {
                console.error(reader.error);
                agEditor.modal_progress.modal('hide')
            };

            formData.append('userimage', file); 
            $.ajax({
                url: agBaseURL+'/ageditor/api/?command=uploadUserImage',
                data: formData,
                type: 'POST',
                contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                processData: false, // NEEDED, DON'T OMIT THIS
                success:function(data){
                    let localresimlerim = [];
                    const index = agEditor.agCropper.awaitingUploads.indexOf(agEditor.agCropper.target_id);
                    if (index > -1) {
                        agEditor.agCropper.awaitingUploads.splice(index, 1);
                    }
                    if(data.url){
                        agEditor.agCropper.agImageUrl = agBaseURL+'/ageditor/'+data.url; 
                        resim           = {"url":agBaseURL+'/ageditor/'+data.url}
                        if(window.localStorage.getItem("localresimlerim")){
                            localresimlerim = JSON.parse(window.localStorage.getItem("localresimlerim"));
                            localresimlerim[Object.keys(localresimlerim).length] = resim;
                        }else{
                            localresimlerim[Object.keys(localresimlerim).length] = resim;
                        }
                        window.localStorage.setItem("localresimlerim",JSON.stringify(localresimlerim))
                    }else if(data.messages){
                        alert(data.messages);
                    }
                },
                beforeSend: function(){
                    agEditor.agCropper.awaitingUploads.push(agEditor.agCropper.target_id);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert("Resim gönderilirken sistem hatası : "+xhr.status);
                    agEditor.agCropper.showMyImages()
                    $(agEditor.agCropper.modal_element).find(".crop-menu-item").hide();
                    $(agEditor.agCropper.modal_element).find(".ag-crop-resim-resimlerim").hide();
                    $(agEditor.agCropper.modal_element).find(".ag-crop-resim-yukle").show();
                }
            });
        })
        file_input.click();
    })

    $(document).on('click','.user-image',function(){
        agEditor.agCropper.agImageUrl       = $(this).attr("src");
        agEditor.agCropper.imageBase64Data  = null;
        agEditor.agCropper.openForCrop();
        $(agEditor.agCropper.modal_element).find(".ag-crop-resim-resimlerim").show();
        $(agEditor.agCropper.modal_element).find(".ag-crop-resim-yukle").hide();
    })

    $(document).on('click','.wrap-user-image .fa-trash-alt',function(){
        let id = $(this).attr("data-lcl-ctoreage-id");
        let  localresimlerim = JSON.parse(window.localStorage.getItem("localresimlerim"));
        if(localresimlerim){
            $(this).parent().remove();
            const newLocalresimlerim = Object.keys(localresimlerim).reduce((object, key) => {
                if (key !== id) {
                  object[key] = localresimlerim[key]
                }
                return object
              }, {})
            window.localStorage.setItem("localresimlerim",JSON.stringify(newLocalresimlerim))
        }
    })

    $(document).on('click','.ag-crop-resim-rotate-left',function(){
        agEditor.agCropper.rotateLeft();
    })

    $(document).on('click','.ag-crop-resim-rotate-right',function(){
        agEditor.agCropper.rotateRight();
    })

    $(document).on('click','.ag-crop-resim-crop',function(){
        agEditor.agCropper.crop();
    })

    $(document).on('click','.ag-edit-font',function(){
        const obj_id = $(this).attr('data-object-id')

        url = agBaseURL+"/ageditor/editor/fonts/fonts.json"
        $.get(url,function(fonts){
            let ul = '<ul>'
            if(fonts){ 
                $.each(fonts,function (i,fv) {    
                    let _font = new FontFace(fv, 'url('+agBaseURL+'/ageditor/editor/fonts/'+fv+'.ttf)');
                    let fnt = _font.load() 
                    fnt.then((loaded_face)=>{
                        document.fonts.add(loaded_face)
                    }).catch((err)=>{
                        console.error("Font yüklenemedi------------ \n"+err)
                    })
                    ul +='\n<li style="font-family:'+fv+'" class="ag-font" data-obj-id="'+obj_id+'" data-font="'+fv+'">'+fv+'</li>';
                }) 
            }
            ul += '\n<ul>'
            $('#modal-font-setting .ag-font-list').html(ul);
        })

        url     = agBaseURL+"/ageditor/editor/lib/colors.json"
        $.get(url,function(colors){ 
            let cDiv    = '';
            if(colors){ 
                $.each(colors,function (i,cv) {
                    cDiv += '\n<div class="ag-color-box" data-obj-id="'+obj_id+'" data-color = "'+cv+'" style="background-color:'+cv+'"></div>'
                })
            }
            $('#modal-font-setting .ag-color-list').html(cDiv);
        })

        $('#modal-font-setting').modal('show')
    })

    $(document).on('click','.ag-font',function(){        
       let font_name    = $(this).attr('data-font')          
       let obj_id       = $(this).attr('data-obj-id')
       obj              = agEditor.getObjectByID(obj_id)
       obj.fontFamily   = font_name;
       agEditor.activeCanvas.renderAll();
    })

    $(document).on('click','.ag-color-box',function(){        
        let color    = $(this).attr('data-color')          
        let obj_id       = $(this).attr('data-obj-id')
        obj              = agEditor.getObjectByID(obj_id)
        obj.setColor(color);
        agEditor.activeCanvas.renderAll();
     })

    $(agEditor.agCropper.modal_element).on('hidden.bs.modal', function () {
        if(agEditor.presentMode == false){
            $(agEditor.target_properties_panel).show();
        }
    })    

    var fullpage = false
    $(document).on('click','.ag-fullpage',function(){
        if(!fullpage){
            $(agEditor.container_html_element).find('.navbar-default').addClass('navbar-fixed-top')
            $(agEditor.container_html_element).addClass('ag-container-fullpage')
            $(agEditor.editor_html_element).css('margin-top','100px')
            $(agEditor.target_properties_panel).css('position','fixed')
            $(agEditor.target_properties_panel).css('top','68px')

            $(agEditor.preview_input_panel).css('position','fixed')
            $(agEditor.preview_input_panel).css('top','68px')
        }else{
            $(agEditor.container_html_element).find('.navbar-default').removeClass('navbar-fixed-top')
            $(agEditor.container_html_element).removeClass('ag-container-fullpage')
            $(agEditor.editor_html_element).css('margin-top','25px')
            $(agEditor.target_properties_panel).css('position','relative')
            $(agEditor.target_properties_panel).css('top','0px')
            $(agEditor.preview_input_panel).css('position','relative')
            $(agEditor.preview_input_panel).css('top','0px')
        }
        fullpage = !fullpage;
    })

    var agContentHeight = $('body').outerHeight(true );
    $(agEditor.container_html_element).css({
        'height': agContentHeight + 'px'
    });

    $(document).on('click','#saveSablonToServer',function(){        
        saveSablonToServer();        
    })
    
    $(document).on('click','.bos-birak',function(){
        const data_object_id    = $(this).attr('data-object-id');
        const obj               = agEditor.getObjectByID(data_object_id);
        
        if($(this).prop("checked") == true){
            if(obj instanceof fabric.Textbox){
                obj.text = ""
            }
            agEditor.activeCanvas.renderAll();
            if(obj instanceof fabric.Textbox){
                $("[data-target-id='"+data_object_id+"']").val('')
            }
            $("[data-target-id='"+data_object_id+"']").attr('disabled', 'disabled');
            if(obj instanceof fabric.Image){
                const w=obj.width;
                const h=obj.height;
                obj.setSrc(agBaseURL+agEditor.agImagePlaceHolder,function () {
                    obj.width   = w
                    obj.height  = h 
                    agEditor.activeCanvas.renderAll();
                });
            }
        }else{
            $("[data-target-id='"+data_object_id+"']").removeAttr('disabled');
        }
        obj.agBosBirak = $(this).prop("checked")        
    })

    // oc admin product formda agEditor tabı açılırken yeniden hesaplanmalı heigt ler
    $(document).on('click','#ag-editor-tab-link',function(){        
        let totalHeight =0
        $('.canvas-container').each(function (elm) {
            const cnv = $(this).find('canvas')[0] 
            $(this).css('height',cnv.scrollHeight+10+'px')
            totalHeight     +=  cnv.scrollHeight+10;
        })

        $('#ageditor').css('height',totalHeight+'px');      
    })
    
})//===========================   End document ready

async function uploadSmallPageImages(w = 300){
    let keys = Object.keys(agEditor.fabricCanvases)
    let index = 0;
    await _uploadSmallPageImg(keys,index,w);
}

async function _uploadSmallPageImg(keys,index,w){
    let key     = keys[index];
    let canvas  = agEditor.fabricCanvases[key]; 
    let dataURI = await agEditor.getJPEG(w,canvas);


    var byteString  = atob(dataURI.split(',')[1]);
    var ab          = new ArrayBuffer(byteString.length);
    var ia          = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    blob =  new Blob([ab], { type: 'image/jpeg' });

    var formData = new FormData();
    formData.append("smalldesigns", blob,"image_name.jpg");

    
    $.ajax({
        url: agBaseURL+'/ageditor/api/?command=uploadSmallPageImages',
        data: formData,
        type: 'POST',
        contentType: false,  
        processData: false,  
        success:function(data){
            if(data.url){
                canvas.agSmallImageUrl = data.url
            }else{
                console.log("agSmallImageUrl alınamadı")
            }
        },
        beforeSend: function(){
            
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Küçük  resim gönderilirken sistem hatası : "+xhr.status);
        }
    });

    if(index<keys.length-1){
        index++;
        await _uploadSmallPageImg(keys,index,w)
    }else{
        return;
    }
}

async function saveSablonToServer() {
    agEditor.modal_progress.modal('show')
    let allCanvasesArr=[];
    for (var key in agEditor.fabricCanvases) {
        if (!agEditor.fabricCanvases.hasOwnProperty(key)) continue;
        let canvas = agEditor.fabricCanvases[key];
        let serialized = JSON.stringify(canvas.toJSON([ "agSablonResmi",
                                                        "agKarakterLimiti",
                                                        "agKutuyaSigdir",
                                                        "agMaxLines",
                                                        "agMaxWidth",
                                                        "agCropImageData",
                                                        "agCropData",
                                                        "agSmallImageUrl",
                                                        "agImageUrl",
                                                        "agFontSize",
                                                        "agBosBirak",
                                                        "evented",
                                                        "hasControls",
                                                        "agIsLogo",
                                                        "height",
                                                        "width",
                                                        "id"
                                                    ]));       
        serialized = serialized.replace( new RegExp(/src\":\"data:image\/([a-zA-Z]*);base64,([^\"]*)\"/,"i"),"src\":\""+agBaseURL+'/'+agEditor.agImagePlaceHolder+"\"")
        allCanvasesArr.push(serialized) 
    }
    const str   = JSON.stringify(allCanvasesArr);
    const bytes = new TextEncoder().encode(str);
    const blob  = new Blob([bytes], {
        type: "application/json"
    });

    var formData = new FormData();  
    formData.append("sablonfile", blob , ag_product_id+'.json');
    //todo: bu işlev müşteri tasarımında işe yarayacam. burada olması sadece deneme amaçlı sonra akldı
    await uploadSmallPageImages(300);
    return new Promise(function(resolve,reject){
        $.ajax({
            url: agBaseURL+'/ageditor/api/?command=saveSablonToServer',
            type: 'post',
            dataType: 'json',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function(json) { 
                if (json['url']) {
                    console.log("uploadSmallPageImages"); 
                    agEditor.modal_progress.modal('hide')
                    resolve();
                }else{
                    agEditor.modal_progress.modal('hide')
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                agEditor.modal_progress.modal('hide')
                alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
            }
        });
    })
}

function openImageBrowser(folder){
    url = agBaseURL+"/ageditor/api/?command=getBgImages&folder="+folder
    $.get(url,function(files){
        $('#modal-kutuphane .modal-body').empty();
        if(files){
            $.each(files,function(i,file){ 
                elm = '<div class="rounded  float-left img-thumbnail">'+
                      '<img src="'+agBaseURL+'/ageditor/api/'+file.path+'">'+
                      '<div class="file-name">'+file.name+'</div>'+
                      '</div>';
                if(file.type == 'folder'){
                    elm =   '<div class="rounded  float-left img-thumbnail" data-path="'+file.path+'" >'+
                            '<i class="fas fa-folder" style="font-size:52px;color:#fec929"></i>'+
                            '<div class="file-name">'+file.name+'</div>'+
                            '</div>';
                }
                $('#modal-kutuphane .modal-body').append(elm);
            })
            if(!$('#modal-kutuphane').hasClass('in')){
                $('#modal-kutuphane').modal('show');
            }
        }
    })
}

function ifExistProductIdinUrl() {  
    let params          = new URLSearchParams(window.location.search)
    if(params.has('product_id')){ 
        ag_product_id   = params.get('product_id')
        return true;
    } else{
        const pid_bulunamadi  =  '<div class="alert alert-light pid-bulunamadi" role="alert">'
                                +'AgEditör\'ü kayıtlı ürünü düzenlerken kullana bilirsiniz.<br>'
                                +'<big>Ürünü kaydedin ve düzenlemek için açın.</big>'
                                +'</div>';
        $(agEditor.container_html_element).append(pid_bulunamadi);
        return false;
    }
}

function getSablonFile() { 
    if(!agEditor.agIsOcFrontpage){
        agEditor.modal_progress.modal('show')
    }
    let url = agBaseURL+'/ageditor/api/sablons/'+ag_product_id+'.json?dummy='+Math.random();
    $.getJSON(url, function(data) {
        agEditor._fromJSON(data);
        agEditor.modal_progress.modal('hide')
      })
      .error(function(xhr, ajaxOptions, thrownError) {     
        console.log("Şablon bulunamadı" + url)      
        agEditor.modal_progress.modal('hide')
        $('.row .thumbnails').show();
        $('.row .ag-thumbnails').hide();
       })
      .complete(function() { 
        agEditor.modal_progress.modal('hide')

        let totalHeight =0
        $('.canvas-container').each(function (elm) {
            const cnv = $(this).find('canvas')[0] 
            $(this).css('height',cnv.scrollHeight+10+'px')
            totalHeight     +=  cnv.scrollHeight+10;
        })

        $('#ageditor').css('height',totalHeight+'px');
         
      });
}

////////////////////////////  OC önsayfası için  ////////////////////
function ocFrontPage_ifProductPage(){
    if($('#product-product').length){
        $('.row .thumbnails').hide();
        $('.row .ag-thumbnails').show();
        agEditor.agIsOcFrontpage = true;
    }
}