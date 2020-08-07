/**
 * Alpay GÜNEŞ
 * alpaygunes@gmail.com
 * alpaygunes.com
 */


var agBaseURL       = "https://www.partimagnet.com/ageditor"
var agEditor;
var ag_gorev        = '' // bg-ekle | logo-ekle
var product_id   = null;
var fullpage = false

document.addEventListener( 'DOMContentLoaded',  async function () {

    agEditor        = new AgEditor();
    
    getWorkedLocationAndProductId();
 
    
    if(agEditor.workLocation =='product_page' 
        || agEditor.workLocation =='order_info_page' 
        || agEditor.workLocation =='product_edit_page' 
        || agEditor.workLocation =='ageditor'){
            if(agEditor.workLocation =='product_page'){
                $(agEditor.nav_html_element).hide();
            }
            $(agEditor.target_properties_panel).hide();  
            getSablonFile().catch(()=>{ 
                eskiVersiondanDonustur();
            }) 

        if(agEditor.workLocation =='product_edit_page'){
            if(product_id == null){
                const pid_bulunamadi  =  '<div class="alert alert-light pid-bulunamadi" role="alert">'
                                        +'AgEditör\'ü kayıtlı ürünü düzenlerken kullana bilirsiniz.<br>'
                                        +'<big>Ürünü kaydedin ve düzenlemek için açın.</big>'
                                        +'</div>';
                $(agEditor.container_html_element).append(pid_bulunamadi); 
            }
        }
    }else if(agEditor.workLocation =='cart_page'){
        getProductPrewievImages();
    }



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
    
    $('#renderWithBigBGImage').click(async function(){

        if(agEditor.activeCanvas){
            let objects = agEditor.activeCanvas.getObjects();
            $.each(objects,(i,obj)=>{ 
                if(obj.agIsLogo){
                    obj.opacity = 0
                }
            }) 
        }
        agEditor.modal_progress.modal('show');
        if(agEditor.activeCanvas.agVersion == "1" ){
            let snc = await renderOldversionBigBGImage();
            if(!snc){
                agEditor.modal_progress.modal('hide');
                return;
            }
        }
        await agEditor.renderWithBigBGImage();
        agEditor.modal_progress.modal('hide');
    }) 

    $('#downloadBigImage').click( async function(){
        agEditor.modal_progress.modal('show');
        setTimeout(async () => {
            await agEditor.downloadBigImage();
            agEditor.modal_progress.modal('hide');
        }, 1);
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

        //eğer belge turu tek_harf banner ise font boyutunu hesaplama
        if(agEditor.agBelgeTuru == 'tek_harfli_banner'){
            let harf_sayisi = text.replace(/\s+/g, '')
            harf_sayisi = harf_sayisi.length;
            if (harf_sayisi % 2 != 0) {
                harf_sayisi++;
            }
            $('#input-quantity').val(harf_sayisi)
            let trgObj = agEditor.getObjectByID(target_id)
            trgObj.agTekHarfliBannerIcinKelime = text
            text = text.charAt(0)
            agEditor.writeToText(target_id,text)
            if(harf_sayisi){
                $('.ag-bannerleri-gor').show()
            }else{
                $('.ag-bannerleri-gor').hide()
            }
            return;
        }

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

        if(agEditor.agBelgeTuru == 'tek_harfli_banner'){
            //karater limitini tikkate alama. çık
            return;
        }

        $(this).css('border-color','#e6e5e5')
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
                url: agBaseURL+'/api/?command=uploadUserImage',
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
                        agEditor.agCropper.agImageUrl = agBaseURL+'/'+data.url; 
                        resim           = {"url":agBaseURL+'/'+data.url}
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

    $(document).on('click','.wrap-user-image .fa-trash',function(){
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
        $('#modal-font-setting').attr('data-obj-id',obj_id)

        url = agBaseURL+"/editor/fonts/fonts.json"         
        let ul = '<ul>'
        $.each(agEditor.fontsJson,function (i,fv) {    
            let _font = new FontFace(fv, 'url('+agBaseURL+'/editor/fonts/'+fv+'.ttf)');
            let fnt = _font.load() 
            fnt.then((loaded_face)=>{
                document.fonts.add(loaded_face)
            }).catch(()=>{
                console.log("Font yüklenemedi font adı " + fv)
            })
            ul +='\n<li style="font-family:'+fv+'" class="ag-font" data-font="'+fv+'">'+fv+'</li>';
        }) 
        ul += '\n<ul>'
        $('#modal-font-setting .ag-font-list').html(ul);
        

        url     = agBaseURL+"/editor/lib/colors.json"
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

    $(document).on('click','.ag-edit-font-size',function(){
        let data_val       = $(this).attr('data-val');
        let data_object_id = $(this).attr('data-object-id');
        let obj            = agEditor.getObjectByID(data_object_id)
        if(data_val == '+'){
            obj.fontSize++
            obj.top--
        }else if(data_val == '-'){
            obj.fontSize--
            obj.top++
        }
        agEditor.activeCanvas.requestRenderAll();
    })
    

    $(document).on('click','.ag-font',function(){     
        $('.ag-font').css('background-color','#fff')  
        $(this).css('background-color','#eee')        
        let font_name    = $(this).attr('data-font')          
        let obj_id       = $('#modal-font-setting').attr('data-obj-id')
        obj              = agEditor.getObjectByID(obj_id)
        obj.fontFamily   = font_name;
        agEditor.activeCanvas.renderAll();
    })

    $(document).on('click','.ag-color-box',function(){       
        $('.ag-color-box').css('border-radius','60px')  
        $(this).css('border-radius','0')  
        let color        = $(this).attr('data-color')
        let obj_id       = $('#modal-font-setting').attr('data-obj-id')
        obj              = agEditor.getObjectByID(obj_id)
        obj.setColor(color);
        agEditor.activeCanvas.renderAll();
     })

    $(agEditor.agCropper.modal_element).on('hidden.bs.modal', function () {
        if(agEditor.presentMode == false){
            $(agEditor.target_properties_panel).show();
        }
    })    

    $(document).on('click','.ag-fullpage',function(){
        switchFullScreen();
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
        $("[data-target-id='"+data_object_id+"']").css('border-color','#e6e5e5')
        
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
                const w = obj.width;
                const h = obj.height;
                obj.setSrc(agBaseURL+agEditor.agImagePlaceHolder,function () {
                    obj.width   = w
                    obj.height  = h 
                    agEditor.activeCanvas.renderAll();
                });
                delete obj.agImageUrl;
            }
        }else{
            $("[data-target-id='"+data_object_id+"']").removeAttr('disabled');
        }
        obj.agBosBirak = $(this).prop("checked")        
    })

 
    $(document).on('click','.ag-modal-tamam-btn',function(){
        let target_obj_id = $('#ag-input-text').attr('data-target-id')
        $("input[data-target-id='"+target_obj_id+"']").val($('#ag-input-text').val());
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

    $(document).on('click','.ag-tasarim-onizleme',function(){        
         $('#modal-cart-image').modal('show')
         let resimler = $(this).find('.ag-cart-thum')
         $('#modal-cart-image .modal-body').empty();
         $.each(resimler,(i,resim)=>{
            let img = "<img src=\""+$(resim).attr("src")+"\">"
            $('#modal-cart-image .modal-body').html($('#modal-cart-image .modal-body').html()+"\n"+img)
         })
    })

    $(document).on('click','#ag-settings',function(){
        if(!agEditor.activeCanvas){
            alert("Seçili sayfa yok")
            return;
        }

        if(agEditor.fabricCanvases.length){
            $('#modal-settings .ag-belge-turu').val(agEditor.agBelgeTuru)
            $('#modal-settings').modal('show')
        } else{
            alert("Henüz  belgeniz yok")
        }
    })

    $(document).on('click','.ag-modal-settings-tamam-btn',function(){
        let belge_turu = $('.ag-belge-turu').val()
        if(belge_turu=='tek_harfli_banner'){
            const Objs= agEditor.activeCanvas.getObjects();
            let sayac = 0;
            $.each(Objs,function(i,obs){
                if(obs instanceof fabric.Textbox){
                    obs.text = 'Yazı Alanı '+ sayac 
                    sayac++;
                }
            })
            if(sayac>1){
                alert("Belgede enfazla bir Yazı Alanı olabilir. Diğerlerini silmelisiniz.")
                return;
            }
        }
        agEditor.agBelgeTuru = belge_turu;
    }) 

    $(document).on('click','.ag-bannerleri-gor',function(){
        if(agEditor.activeCanvas){
            bannerleriGor()
        }else{
            alert("Aktif sayfa yok")
        }
    })
    
    
})//===========================   End document ready


async function renderOldversionBigBGImage() {
    let params          = new URLSearchParams(window.location.search)
    if(params.has('model')){ 
        model   = params.get('model')  
        model_suffixarr = model.match(/\d/g);
        model_suffix    = model_suffixarr.join("");
        ilk_rakam_pos   = model.indexOf(model_suffixarr[0])
        model_prefix    = model.substring(0 , ilk_rakam_pos);            
    }else{
        console.log("Model no bulunamadı")
    }

    
    async function resimVarmi(){
        return new Promise((resolve,reject)=>{
            let orjinalBuyukResim = agEditor.activeCanvas.agBigImgSrc
            let resim       = new Image();
            resim.addEventListener('load',function(){ 
                resolve(true);
            })  
            resim.addEventListener('error',function(){ 
                console.log("Büyük resim bu adreste bulunamadı \n"+resim.src) 
                reject(resim.src);
            })  
            resim.src = orjinalBuyukResim;
        })
    }

    let sonuc = await resimVarmi().catch((sonuc)=>{ 
            alert("Orjinal zemin resmi bulunamadığından resim büyütülemiyor\n"+sonuc)
            return false;
            
    })
    if(!sonuc){
        return false; 
    }

    zeminResmi  = agEditor.getObjectByID('bg').getSrc();    
    if(agEditor.activeCanvas){
        return new Promise((resolve,reject)=>{
            fabric.Image.fromURL(zeminResmi, function(oImg) {
                if (!oImg._element){
                    alert("Büyük resim bu yolda bulunamadı \n"+zeminResmi)
                    reject(false)
                    return;
                }
                let objects = agEditor.activeCanvas.getObjects();
                $.each(objects,(i,obj)=>{ 
                    let top     = obj.top - koseNoktalari[model_suffix][0]
                    obj.set('top',top)
                    let left    = obj.left- koseNoktalari[model_suffix][1]
                    obj.set('left',left)
                    agEditor.activeCanvas.requestRenderAll(); 
                })
                agEditor.activeCanvas.setDimensions({
                    width: agEditor.activeCanvas.width-(2*koseNoktalari[model_suffix][1]),
                    height: agEditor.activeCanvas.height-(2*koseNoktalari[model_suffix][0])
                })
                resolve(true);
            })
        })
    }








 
}

async function uploadSmallPageImages(w = 300){
    let keys = Object.keys(agEditor.fabricCanvases)
    let index = 0;
    return new Promise(async(resolve,reject)=>{
        await _uploadSmallPageImg(keys,index,w);
        resolve();
    })
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
    blob =  new Blob([ab], { type: 'image/png' });

    var formData = new FormData();
    formData.append("smalldesigns", blob,"image_name.png");

    let gndr = new Promise(async(resolve,reject)=>{
        $.ajax({
            url: agBaseURL+'/api/?command=uploadSmallPageImages',
            data: formData,
            type: 'POST',
            contentType: false,  
            processData: false,  
            success:function(data){
                if(data.url){
                    canvas.agSmallImageUrl = data.url 
                    resolve();
                }else{
                    console.log("agSmallImageUrl alınamadı")
                    alert("Küçük  resim gönderilirken sistem hatası");
                    reject();
                }
            },
            beforeSend: function(){
                
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert("Küçük  resim gönderilirken sistem hatası : "+xhr.status);
                reject();
            }
        });
    })

    await gndr.then(async()=>{
        if(index<keys.length-1){
            index++;
            await _uploadSmallPageImg(keys,index,w)
            return;
        } 
    })

}

async function saveSablonToServer() {
    agEditor.modal_progress.modal('show')
    let allCanvasesArr= [{'agBelgeTuru':agEditor.agBelgeTuru}]; 
    for (var key in agEditor.fabricCanvases) {
        if (!agEditor.fabricCanvases.hasOwnProperty(key)) continue;
        let canvas = agEditor.fabricCanvases[key];
        //let serialized = JSON.stringify(canvas.toJSON(agEditor.agJsonExportOptions));       
        //serialized = serialized.replace( new RegExp(/src\":\"data:image\/([a-zA-Z]*);base64,([^\"]*)\"/,"i"),"src\":\""+agBaseURL+'/'+agEditor.agImagePlaceHolder+"\"")
        let cnv         = canvas.toJSON(agEditor.agJsonExportOptions)
        $.each(cnv.objects,function(i,obj){
            if(!obj.agSablonResmi){
                obj.src = agBaseURL+agEditor.agImagePlaceHolder
            }
        })
        allCanvasesArr.push(cnv) 
        //allCanvasesArr.push(canvas.toJSON(agEditor.agJsonExportOptions))
    }
    const str   = JSON.stringify(allCanvasesArr);
    const bytes = new TextEncoder().encode(str);
    const blob  = new Blob([bytes], {
        type: "application/json"
    });

    var formData = new FormData();  
    formData.append("sablonfile", blob , product_id+'.json');
    return new Promise(function(resolve,reject){
        $.ajax({
            url: agBaseURL+'/api/?command=saveSablonToServer',
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
    url = agBaseURL+"/api/?command=getBgImages&folder="+folder
    $.get(url,function(files){
        $('#modal-kutuphane .modal-body').empty();
        if(files){
            $.each(files,function(i,file){ 
                elm = '<div class="rounded  float-left img-thumbnail">'+
                      '<img src="'+agBaseURL+'/api/'+file.path+'">'+
                      '<div class="file-name">'+file.name+'</div>'+
                      '</div>';
                if(file.type == 'folder'){
                    elm =   '<div class="rounded  float-left img-thumbnail" data-path="'+file.path+'" >'+
                            '<i class="fa fa-folder" style="font-size:52px;color:#fec929"></i>'+
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

async function getSablonFile() { 
    if(agEditor.workLocation!='product_page'){
        agEditor.modal_progress.modal('show')
    }else{
        product_id      = $('[name="product_id"]').val();
    }
    let url = agBaseURL+'/api/sablons/'+product_id+'.json?dummy='+Math.random();

    if(typeof agfileurl !== "undefined"){ 
        url = agfileurl.replace(/&amp;/g, "&"); 
    }

    return new Promise(function(resolve,reject){
        $.getJSON(url, function(data) {
                agEditor._fromJSON(data);
                agEditor.modal_progress.modal('hide')
                $('.ag-alanseti').show();
                $('.fa-spin').remove();
                resolve();
            }).error(function(xhr, ajaxOptions, thrownError) {
                console.log("Şablon bulunamadı \n" + url)      
                agEditor.modal_progress.modal('hide')
                reject();
            }).complete(function() {
                agEditor.modal_progress.modal('hide')
                let totalHeight =0
                $('.canvas-container').each(function (elm) {
                const cnv = $(this).find('canvas')[0] 
                $(this).css('height',cnv.scrollHeight+10+'px')
                totalHeight     +=  cnv.scrollHeight+10;
                resolve();
            })
            $('#ageditor').css('height',totalHeight+'px');
        });
    })
}

function switchFullScreen(){

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
}

async function bannerleriGor(){

    $('#modal-banner-goster .ag-progres').show();
    let harfler                 = ''
    let objects                 = agEditor.activeCanvas.getObjects()  

    $.each(objects,(i,obj)=>{
        if(obj.agTekHarfliBannerIcinKelime && obj instanceof  fabric.Textbox){
            harfler             = obj.agTekHarfliBannerIcinKelime
            harfler             = harfler.replace(/\s+/g, '')
            return false;
        }
    })
        
    let allCanvasesArr          = [{'agBelgeTuru':agEditor.agBelgeTuru}]; 
    for (var key in agEditor.fabricCanvases) {
        if (!agEditor.fabricCanvases.hasOwnProperty(key)) continue;
        let canvas              = agEditor.fabricCanvases[key];
        allCanvasesArr.push(canvas.toJSON(agEditor.agJsonExportOptions)) 
    }



    allCanvasesArr = [{'agBelgeTuru':agEditor.agBelgeTuru}];
    for(index in harfler){  
        // canvası clonlayıp harf sayısı kadar çoğaltalım
        let canvas              = agEditor.fabricCanvases[1];
        let cloneCanvas         = Object.assign({},canvas.toJSON(agEditor.agJsonExportOptions))
        for(var key in cloneCanvas.objects){
            if(cloneCanvas.objects[key].agTekHarfliBannerIcinKelime){
                cloneCanvas.objects[key].text = harfler[index]
                cloneCanvas.id = 100+index
            }
        }
        allCanvasesArr.push(cloneCanvas) 
    }


    $('#modal-banner-goster').modal('show')
    $('#ag-banner-editor').empty();
    bannerEditor                            = new AgEditor();
    bannerEditor.editor_html_element        = $(null);
    bannerEditor.agPresentation.preview_input_panel        = $('null');
    bannerEditor.modal_progress             = $('null');
    bannerEditor.target_properties_panel    = $('null');
    bannerEditor.nav_html_element           = $('null');
    bannerEditor.preview_input_panel        = $('null');
    await bannerEditor._fromJSON(allCanvasesArr);
    
    for(let ind in bannerEditor.fabricCanvases){
        let cnvs    = bannerEditor.fabricCanvases[ind];
        let dataURI = await bannerEditor.getJPEG(300,cnvs) 
        $('#ag-banner-editor').append('<img src="'+dataURI+'"/>')
    }
    $('#modal-banner-goster .ag-progres').hide();
}













////////////////////////////  OC önsayfası için  ////////////////////
function getWorkedLocationAndProductId(){
    let params          = new URLSearchParams(window.location.search)
    if(params.has('product_id')){ 
        product_id   = params.get('product_id')
    }

    if($('.product-info').length){
        $('.left .col-sm-6').hide(); 
        agEditor.workLocation  = 'product_page';
        $("button[id^='button-upload']").hide();
        $("button[id^='button-upload']").prev().hide(); 
        if($('[name="product_id"]').length==0){
            console.log("Çalışma konumu önsayfa fakat product_id yok. Allah Allah :(")
            return;
        }
        product_id      = $('[name="product_id"]').val();
        $('.left').prepend(progresBar);
    }else if(window.location.search.includes('checkout/cart')){ 
        agEditor.workLocation  = 'cart_page';
    }else if($('#tab-ageditor').length){
        agEditor.workLocation  = 'product_edit_page';
    }else if(typeof agfileurl  !== 'undefined'){
        agEditor.workLocation  = 'order_info_page';
        switchFullScreen();
    }else if(window.location.href.includes('/ageditor/?product_id=')){
        agEditor.workLocation  = 'ageditor';
    }
}

async function createAndUploadAgeditorJson(){ 
    let zorunluAlanVar = false;
    if($('button[id^=\'button-upload\']').length == 0){
        alert("Ürünün 'Dosya Gönderme' seçeneği olmalı. Hata !");
        reject();
    }

    // BOŞ  resim yada yazı alanı varsa uyaralım
    for (var key in agEditor.fabricCanvases) {
        if (!agEditor.fabricCanvases.hasOwnProperty(key)) continue;
        let canvas      = agEditor.fabricCanvases[key];
        let objects     = canvas.getObjects();
        $.each(objects,(i,obj)=>{
            if(obj instanceof fabric.Textbox){
                if(!obj.agBosBirak){
                    let str = obj.text.replace(/\s/g, '');
                    if(!str.length){
                        zorunluAlanVar = true
                        $("[data-target-id='"+obj.id+"']").css('border','4px solid #ff0000')
                    }
                }
            }else if(obj instanceof fabric.Image
                    && !obj.agSablonResmi 
                    && !obj.agIsLogo){
                if(!obj.agBosBirak){ 
                    if(!obj.agImageUrl){
                        zorunluAlanVar = true
                        $("[data-target-id='"+obj.id+"']").css('border','4px solid #ff0000')
                        //$("[data-target-id='"+obj.id+"']").css('border-color','#ff0000')
                    }
                }
            }
        })        
    }
    if(zorunluAlanVar){
        $([document.documentElement, document.body]).animate({
            scrollTop: $(".ag-input-panel").offset().top
        }, 200);
        return;
    }
     

    await uploadSmallPageImages(300);
    let allCanvasesArr          = [{'agBelgeTuru':agEditor.agBelgeTuru}]; 
    for (var key in agEditor.fabricCanvases) {
        if (!agEditor.fabricCanvases.hasOwnProperty(key)) continue;
        let canvas      = agEditor.fabricCanvases[key];
        //let serialized  = JSON.stringify(canvas.toJSON(agEditor.agJsonExportOptions));       
        //serialized      = serialized.replace( new RegExp(/src\":\"data:image\/([a-zA-Z]*);base64,([^\"]*)\"/,"i"),"src\":\""+agBaseURL+'/'+agEditor.agImagePlaceHolder+"\"")      
        let cnv         = canvas.toJSON(agEditor.agJsonExportOptions)
        $.each(cnv.objects,function(i,obj){
            if(!obj.agSablonResmi){
                obj.src = agBaseURL+agEditor.agImagePlaceHolder
            }
        })
        allCanvasesArr.push(cnv) 
    }


    const str   = JSON.stringify(allCanvasesArr);
    const bytes = new TextEncoder().encode(str);
    const blob  = new Blob([bytes], { type: "application/json" });

    $('#form-upload').remove();
    $('body').prepend('<form enctype="multipart/form-data" id="form-upload" style="display: none;">'+
            '<input type="file" name="file" />'+
            '</form>');
    
    var form        = document.querySelector('#form-upload');
    var formData    = new FormData(form);
    formData.append("file", blob , 'ageditorJson.json');

    return new Promise(function(resolve,reject){
        $.ajax({
            url: 'index.php?route=tool/upload',
            type: 'post',
            dataType: 'json',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function() {
            },
            complete: function() {
            },
            success: function(json) {    
                if (json['error']) {
                    alert("Tasarım dosyası gönderilemedi. Sistemsel bir hata oldu")
                    reject();
                }    
                if (json['success']) {
                    node = $('button[id^=\'button-upload\']')[0];
                    $(node).parent().find('input').val(json['code']);
                    console.log("AgEditor.json dosyası gönderildi")
                    resolve(true);
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
            }
        });
    })
}

async function getProductPrewievImages() {
    if($('.ag-json-url').length){
        let htmlElems = $('.ag-json-url')
        $.each(htmlElems,(i,elms)=>{
            let url = elms.value
            return new Promise(function(resolve,reject){
                $.getJSON(url, function(datas) {                     
                        let tr      = $(elms).parent().parent()
                        first_td    = $(tr).find('td')[0];
                        $(first_td).empty();
                        $.each(datas,(i,val)=>{
                            if(i==0){return;}
                            let v = val
                            let gorun = ''
                            if(i==1){
                                gorun = "style = style:display:block!important"
                            }
                            $(first_td).append("<img "+gorun+" class='img-thumbnail ag-cart-thum' src='"+agBaseURL+'/'+v.agSmallImageUrl+"'>")
                        })
                        resolve();
                    }).error(function(xhr, ajaxOptions, thrownError) {
                        console.log("agjson dosyası bulunamadı \n" + url)  
                        reject();
                    }).complete(function() {
                        resolve();
                    });
            })
        })
    }
}