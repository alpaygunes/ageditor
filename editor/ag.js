$('document').ready(function(){
    var agEditor = new AgEditor();
    var gorev = '' // bg-ekle | logo-ekle
    $('[data-toggle="tooltip"]').tooltip()
    //$('.navbar-nav .nav-link').hide();
    
    $('#ag-yeni').click(function(){
        $('#modal-yeni').modal();
    })

    $('#bg-ekle').click(function(){
        gorev = 'bg-ekle'
        openImageBrowser('/');
    })

    $('#textarea-ekle').click(function(){
        agEditor.addTextArea();
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
        await agEditor.openJsonFromLocal();
        agEditor.agPresentation.presentMode = true;// orada tersi olacak
        agEditor.agPresentation.prewiev(); 
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

    $('body').on('change','.form-control',function(){
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

    $(document).on('keyup','.ag-textbox',function(){
        let target_id   = $(this).attr('data-target-id')
        let text        = $(this).val();
        agEditor.writeToText(target_id,text)
    })

    $(document).on('click','.ag-resimekle-btn',function(){
        let target_id   = $(this).attr('data-target-id')
        agEditor.agCropper.target_id = target_id
        agEditor.agCropper.show()
    })

    $(document).on('click','.ag-crop-resim-resimlerim',function(){ 
        agEditor.agCropper.showMyImages()
    })

    $('.ag-crop-resim-yukle').click(()=>{
        let formData = new FormData();
        let file_input  = document.createElement("INPUT");
        file_input.setAttribute("type", "file");
        file_input.setAttribute("accept", "image/x-png,image/gif,image/jpeg");
        
        $(file_input).on('change',(inpt)=>{
            let file = $(inpt)[0].currentTarget.files[0];
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function() {
                agEditor.agCropper.imageBase64Data = reader.result; 
                agEditor.agCropper.showImage();
            };
            reader.onerror = function() {
                console.error(reader.error);
            };

            formData.append('userimage', file); 
            $.ajax({
                url: 'api/?command=uploadUserImage',
                data: formData,
                type: 'POST',
                contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                processData: false, // NEEDED, DON'T OMIT THIS
                success:function(data){
                    const index = agEditor.agCropper.awaitingUploads.indexOf(agEditor.agCropper.target_id);
                    if (index > -1) {
                        agEditor.agCropper.awaitingUploads.splice(index, 1);
                    }
                    if(data.url){
                        agEditor.agCropper.imageUrl = data.url;
                    }else if(data.messages){
                        alert(data.messages);
                    }
                },
                beforeSend: function(){
                    agEditor.agCropper.awaitingUploads.push(agEditor.agCropper.target_id);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert("Resim gönderilirken sistem hatası : "+xhr.status);
                    $(agEditor.agCropper.modal_element).find('.modal-body').empty();
                }
            });
        })
        file_input.click();
    })

    

})//End document ready













function openImageBrowser(folder){
    url = "api/?command=getBgImages&folder="+folder
    $.get(url,function(files){
        $('#modal-kutuphane .modal-body').empty();
        if(files){
            $.each(files,function(i,file){ 
                elm = '<div class="rounded  float-left img-thumbnail">'+
                      '<img src="'+'api/'+file.path+'">'+
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