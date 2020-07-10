
document.addEventListener( 'DOMContentLoaded',  async function () {
    let product_id = $('[name="product_id"]').val();
    iceriklerJSON = await getIceriklerJSON(product_id);
    if(iceriklerJSON!='false'){
        createFabricCanvas(iceriklerJSON);
    }
});//----------------- END Documend Ready ------------------------


async function  getIceriklerJSON(product_id){ 
    return new Promise(function(resolve,reject){
        var data = new FormData();
        data.append('product_id', product_id);
        jQuery.ajax({
            url: '?route=tasarim/icerikver/getIceriklerArr',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function(data){
                // eğer onbellekten geldiyse baında ve sonunda ikitane çift
                // tırkan vardır onların temizlenip tek e indirilmesi gerekli
                var res = data.substring(0,1);
                if(res=='"'){
                    data = data.substring(1,data.length-1);
                }
                iceriklerArr = JSON.parse(data);
                resolve(iceriklerArr)
            },
            error: errorHandler = function(xhr, status, error) {
                alert("Dönüştürürken içerik bulunamadı ", error)
                reject('false');
            }
        });
    })
}


//------------------------ Create Fabric Canvas --------------------------
function createFabricCanvas(iceriklerJSON){
    // zemin resmini alıp canvası oluşturalım
    let zemin  = '';
    $.each(iceriklerJSON,(i,icerik)=>{
        if(icerik.tur == 'zemin'){
            zemin = icerik
            return;
        }
    })
    if(zemin==''){alert("Zemin resmi bulunamadı")}
    // eğer zemin bulunduysa canvas oluşturup resmi zemin olarak ayarlayalım 
    agEditor.addCanvas();
    $('.ag-alanseti').show();
    $('.left .col-sm-6').hide();

    let imgElm = new Image()
    imgElm.src = zemin.src;
    imgElm.onload = ()=>{
        agEditor.setPageBgImage(imgElm);
        agEditor.activeCanvas.renderAll();
    }
    
}