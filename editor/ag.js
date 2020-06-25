var baseURL = "http://opencart.test"
$('document').ready(function(){
    var agEditor    = new AgEditor();
    agEditor._refreshMainMenu()
    var gorev       = '' // bg-ekle | logo-ekle
    $('[data-toggle="tooltip"]').tooltip()
    
    $('#ag-yeni').click(function(){
        $('#modal-yeni').modal();
    })

    $('#bg-ekle').click(function(){
        gorev = 'bg-ekle'
        openImageBrowser('/');
    })

    $('#textarea-ekle').click(function(){
        agEditor.addTextArea();
        uploadSmallPageImages(300)
    })

    $('#croparea-ekle').click(function(){
        agEditor.addCropArea();
    })

    $('#logo-ekle').click(function(){
        gorev = 'logo-ekle'
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
        agEditor = new AgEditor();
        await agEditor.openJsonFromLocal(); 
        setTimeout(() => {
            agEditor.sunumuBaslat(); 
        }, 50);
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
            if(gorev == "bg-ekle"){
                agEditor.setPageBgImage(imgElm);
            }else if(gorev == "logo-ekle"){
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


    $(document).on('keydown','.ag-textbox',function(e){
        let target_id   = $(this).attr('data-target-id') 
        let fbTxtObj    = agEditor.getObjectByID(target_id)
        let text        = $(this).val(); 

        if(fbTxtObj.agFontSize==0){
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

    $(document).on('click','.ag-resimekle-btn',function(){

        let target_id                   = $(this).attr('data-target-id')
        agEditor.agCropper.targetObj    = agEditor.getObjectByID(target_id)
        agEditor.agCropper.show()
        agEditor.agCropper.showMyImages()
        if(agEditor.agCropper.targetObj.agImageUrl){
            agEditor.agCropper.agImageUrl = agEditor.agCropper.targetObj.agImageUrl;
            agEditor.agCropper.imageBase64Data = null;
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
                url: baseURL+'/ageditor/api/?command=uploadUserImage',
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
                        agEditor.agCropper.agImageUrl = data.url; 
                        resim           = {"url":data.url}
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
        agEditor.agCropper.agImageUrl = $(this).attr("src");
        agEditor.agCropper.imageBase64Data = null;
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

    $(agEditor.agCropper.modal_element).on('hidden.bs.modal', function () {
        if(agEditor.presentMode == false){
            $(agEditor.target_properties_panel).show();
        }
    })    

    async function uploadSmallPageImages(w = 300){
        let keys = Object.keys(agEditor.fabricCanvases)
        let index = 0;
        await _uploadPageImg(keys,index,w);
    }
    
    async function _uploadPageImg(keys,index,w){
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
            url: baseURL+'/ageditor/api/?command=uploadSmallPageImages',
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
            await _uploadPageImg(keys,index,w)
        }else{
            return;
        }
    }

})//End document ready






function openImageBrowser(folder){
    url = baseURL+"/ageditor/api/?command=getBgImages&folder="+folder
    $.get(url,function(files){
        $('#modal-kutuphane .modal-body').empty();
        if(files){
            $.each(files,function(i,file){ 
                elm = '<div class="rounded  float-left img-thumbnail">'+
                      '<img src="'+baseURL+'/ageditor/api/'+file.path+'">'+
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
                $('#modal-kutuphane').modal();
            }
        }
    })
}