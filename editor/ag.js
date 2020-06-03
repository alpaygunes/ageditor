$('document').ready(function(){
    var agEditor = new AgEditor();
    var gorev = '' // bg-ekle | logo-ekle
    $('[data-toggle="tooltip"]').tooltip()
    $('.navbar-nav .nav-link').hide();
    
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

    $('#openJsonFromLocal').click(function(){
        agEditor.openJsonFromLocal();
    })

    $('#sendBackwards').click(function(){ 
        let index = agEditor.activeCanvas.getObjects().indexOf(agEditor.activeCanvas.getActiveObject())
        if(index>1){
            agEditor.activeCanvas.sendBackwards(agEditor.activeCanvas.getActiveObject())
        }
    })
    
    $('#bringForward').click(function(){ 
        agEditor.activeCanvas.bringForward(agEditor.activeCanvas.getActiveObject())
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

    $('.sablon').click(function(){
        sablon_adi  = $(this).attr('data-sablon-adi');
        url         = "editor/sablonlar/"+sablon_adi+'.json'
        $.get( url, function(agdocument) { 
            agEditor.empty();
            agEditor.createPages(agdocument); 
        });
    })

    $('body').on('change','.form-control',function(){
        prop_name   = $(this).attr('data-prop-name');
        value       = $(this).val();
        agEditor.setObjectProperties(prop_name,value);
    })

    $('body').on('click','.ag-checkbox',function(){ 
        prop_name   = $(this).attr('data-prop-name');
        value       = $(this).is(':checked')?1:0;
        agEditor.setObjectProperties(prop_name,value);
    })

})//end documenar ready


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