$('document').ready(function(){
    var agEditor = new AgEditor();

    
    $('#ag-yeni').click(function(){
        $('#modal-yeni').modal();
    })


    $('#bg-ekle').click(function(){
        getBigImages('/');
    })

    $('.modal-body').on('click','.img-thumbnail',function(){
        folder = $(this).attr('data-path')
        getBigImages(folder);
    })
 

    
    $('.sablon').click(function(){
        sablon_adi  = $(this).attr('data-sablon-adi');
        url         = "editor/sablonlar/"+sablon_adi+'.json'
        $.get( url, function(agdocument) { 
            agEditor.empty();
            agEditor.createPages(agdocument); 
        });
    })
})//end documenar ready


function getBigImages(folder){
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