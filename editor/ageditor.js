/**
 * Alpay GÜNEŞ
 * alpaygunes@gmail.com
 * alpaygunes.com
 */

class AgEditor {

    constructor(){
        this.agImagePlaceHolder         = "/editor/agblank.png";
        this.workLocation               = '';
        this.preview_input_panel        = $('#preview-input-panel');
        this.agPresentation             = new AgPresentation(this);
        this.agCropper                  = new AgCropper(this);
        this.container_html_element     = $('.ag-container');
        this.editor_html_element        = $('#ageditor');
        this.modal_progress             = $('#modal-progress');
        this.target_properties_panel    = $('#properties-panel');
        this.nav_html_element           = $('.ag-container .navbar');
        this.fabricCanvases             = [];
        this.activeCanvas               = null;
        this.presentMode                = false;
        this.fontsJson                  = null;
        this.bolds                      = {normal:"Normal",bold:"Bold"}
        this.italics                    = {normal:"Normal",italic:"Italic"}
        this.align                      = {"Left":"left"
                                            ,"Center":"center"
                                            ,"Right":"right"
                                            ,"Justify":"justify"
                                            ,"Justify Left":"justify-left"
                                            ,"Justify Center":"justify-center"
                                            ,"Justify Right":"justify-right"}
        this.drawObjectsBordered        = false;
        this.agJsonExportOptions        = [ 
                                            "agSablonResmi",
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
                                            "agBigImgSrc",
                                            "agVersion",
                                            "agBelgeTuru",
                                            "agTekHarfliBannerIcinKelime",
                                            "evented",
                                            "hasControls",
                                            "agIsLogo",
                                            "height",
                                            "width",
                                            "id"
                                        ]
        this._loadfonts();
        this.agBelgeTuru                = 'varsayilan_belge';
    }

    async refreshMainMenu(){
        if(!Object.keys(this.fabricCanvases).length){
            $('.nav-link').hide();
            $('#openJsonFromLocal').show();
            $('#canvas-ekle').show();
        }else{
            $('.nav-link').show();
        }

        if(this.activeCanvas){
            $('#bg-ekle').show();
            $('#textarea-ekle').show();
            $('#croparea-ekle').show();
            $('#logo-ekle').show();
            $('#obje-sil').show();
            $('#sunumuBaslat').show();
            $('#renderWithBigBGImage').show();
            $('#downloadBigImage').show();
        }else{
            $('#bg-ekle').hide();
            $('#textarea-ekle').hide();
            $('#croparea-ekle').hide();
            $('#logo-ekle').hide();
            $('#obje-sil').hide();
            $('#renderWithBigBGImage').hide();
            $('#downloadBigImage').hide();
        }

        if(this.presentMode){
            $('.nav-link').hide();
            $('#sunumuBaslat').show();
        }

        if(this.workLocation =='order_info_page' ){
            $('#saveSablonToServer').hide();
        }
    }

    async setPageBgImage(imgElm){
        let BU = this;
        if(this.activeCanvas){  
            this.activeCanvas.setHeight($(imgElm).get(0).naturalHeight);
            this.activeCanvas.setWidth($(imgElm).get(0).naturalWidth);
            fabric.Image.fromURL($(imgElm).attr('src'), function(oImg) {
                BU.activeCanvas.remove(BU.getObjectByID('bg'))
                oImg.id             = "bg"
                oImg.lockMovementX  = oImg.lockMovementY = true;
                oImg.hasControls    = false
                oImg.evented        = false
                oImg.agSablonResmi  = true  
                BU.activeCanvas.add(oImg);
                BU.activeCanvas.moveTo(oImg, 0) 
                BU.activeCanvas.setZoom(1); 
            }); 
        }else{
            alert("Sayfa seçin")
        }
    }

    async addCanvas(page){
        let BU = this;
        return new Promise(async (resolve,reject)=> {
            if(!page){
                page    = {id:Object.keys(BU.fabricCanvases).length + 1,w:600,h:700,bgColor:"#ffffff"}
            }
            let id      = page.id;
            let w       = page.w;
            let h       = page.h;
            let bgColor = page.bgColor;

            $(BU.editor_html_element).append('<canvas id="'
                                                + id + '" width="'
                                                + w + '"  height="'
                                                + h + '"></canvas>');
            if(BU.workLocation!='product_page'){
                $(BU.editor_html_element).append('<div class="clear"></div');
            }

            let canvas          = new fabric.Canvas(id.toString(),{backgroundColor:bgColor});
            canvas.width        = w;
            canvas.height       = h;
            canvas.id           = id;
            canvas.agSmallImageUrl='';
            canvas.selection    = false;
            canvas.agVersion    = "2";

            $('.canvas-container').css('outline','none');
            if(BU.workLocation!='product_page'){
                $('#'+id).parent().css('outline','thick solid aqua');
            }

            canvas.on("mouse:down", (e)=>{
                BU.agPresentation.createInputPanel(canvas);
                $('.canvas-container').css('outline','none');
                BU.activeCanvas = canvas;

                if(BU.workLocation!='product_page'){
                    BU.refreshMainMenu()
                }
                if(BU.workLocation!='product_page'){
                    $('#'+id).parent().css('outline','thick solid aqua');
                }
                if(!e.target){
                    BU.refreshPropertiesPanel(canvas); 
                }else{
                    BU.refreshPropertiesPanel(e.target);
                    if(BU.presentMode == true  && e.target instanceof fabric.Image   && !e.target.agSablonResmi && !e.target.agIsLogo){
                            if(e.target.agBosBirak){return;}
                            let target_id           = e.target.id
                            $(BU.target_properties_panel).hide();
                            BU.agCropper.targetObj  = BU.getObjectByID(target_id)
                            BU.agCropper.show()
                            BU.agCropper.showMyImages()
                            if(e.target.agImageUrl){
                                BU.agCropper.agImageUrl = e.target.agImageUrl;
                                BU.agCropper.imageBase64Data = null;
                                BU.agCropper.openForCrop();
                                $(BU.agCropper.modal_element).find(".ag-crop-resim-resimlerim").show();
                                $(BU.agCropper.modal_element).find(".ag-crop-resim-yukle").hide();
                            }
                    }else if(BU.presentMode == true  && e.target instanceof fabric.Textbox ){
                        let text = e.target.text 
                        if(BU.agBelgeTuru == 'tek_harfli_banner'){
                            text = e.target.agTekHarfliBannerIcinKelime;
                        }
                        if(e.target.agMaxLines == 1){
                            $('#modal-text-input .ag-textarea').hide();
                            $('#modal-text-input #ag-input-text').show();
                            $('#modal-text-input #ag-input-text').attr('data-target-id',e.target.id)
                            $('#modal-text-input #ag-input-text').val(text)
                        }else{
                            $('#modal-text-input .ag-textarea').show();
                            $('#modal-text-input #ag-input-text').hide();
                            let  style = '';
                            style           += "font-family:"+e.target.fontFamily+";"
                            style           += "font-size:"+e.target.fontSize*e.target.scaleX+"px!important;"
                            style           += "text-align:"+e.target.textAlign+";";
                            style           += "width:"+e.target.getScaledWidth()+"px;"
                            style           += "height:"+(e.target.fontSize*e.target.agMaxLines)+"px!important;"
                            style           += "padding:0px!important;"
                            style           += "margin-left: auto;"
                            style           += "display: block;"
                            style           += "margin-right: auto;"
                            
    
    
                            $('#modal-text-input .ag-textarea').attr('data-target-id',e.target.id)
                            $('#modal-text-input .ag-textarea').val(text) 
                            $('#modal-text-input .ag-textarea').attr('rows',e.target.agMaxLines) 
                            $('#modal-text-input .ag-textarea').attr('style',style) 
                            
                        }       
                        $('#modal-text-input').modal('show')                        
                    }
                }
            });// end mouse:down

            canvas.BU = this
            canvas.on({
                'object:moving': this.updateControls,
                'object:scaling': this.updateControls,
                'object:resizing': this.updateControls,
                'object:rotating': this.updateControls
            });// end 

            canvas.on('mouse:over', function(e) {
                BU.drawObjectsBorder(canvas,true); 
            });// end mouse:over

            canvas.on('mouse:out', function(e) {
                BU.drawObjectsBorder(canvas,false); 
            });// end mouse:out

            BU.fabricCanvases[id] = canvas; 
            if(BU.activeCanvas){
                $(BU.activeCanvas.wrapperEl).css('outline','none');
            }

            BU.activeCanvas = canvas;
            BU.refreshMainMenu()
            resolve(canvas);
        })
    }

    async addTextArea(){
        const Objs= this.activeCanvas.getObjects();
        let sayac = 0;
        $.each(Objs,function(i,obs){
            if(obs instanceof fabric.Textbox){
                obs.text = 'Yazı Alanı '+ sayac 
                sayac++;
            }
        })

        if(this.agBelgeTuru=='tek_harfli_banner' && sayac>0){
            alert("Tek harfli banner belgesine ikinci text kutu ekleyemezsiniz!")
            return;
        }

        let BU = this;
        if(this.activeCanvas){
            let textBoxFabricInstance =   new fabric.Textbox('Yazı Alanı '+ sayac, 
            {
                id:             Math.floor(Math.random() * 100000) + 1,
                fontFamily:     "arial",
                left:           100,
                top:            100, 
                width:          200,
                fontSize:       24,
                fill:           "#000000",
                textAlign:      "left",
                stroke:         "#ffffff",
                strokeWidth:    0,
                strokeLineJoin: "round",
                textAlign:      "center",
                centeredRotation: true,
                angle:          0,
                strokeUniform   : true,
                agFontSize      : 0,
                agMaxLines      : 1,
                agMaxWidth      : 200,
                agKarakterLimiti: 30,
                agKutuyaSigdir  : true,
                agBosBirak : false
            });

            textBoxFabricInstance.setControlsVisibility({
                bl: false,
                br: false,
                tl: false,
                tr: false,
                mb: false,
                ml: true,
                mr: true,
                mt: false,
                mtr: true,
            });

            //textBoxFabricInstance.on({"scaling":this.scalingHadler})
            await this.loadFont(textBoxFabricInstance.fontFamily);
            textBoxFabricInstance.agKarakterLimiti      = 30
            textBoxFabricInstance.agKutuyaSigdir        = 1
            textBoxFabricInstance.agMaxLines            = 1
            textBoxFabricInstance.agTekHarfliBannerIcinKelime =''
            BU.activeCanvas.add(textBoxFabricInstance);
            BU.activeCanvas.requestRenderAll();
            
        }else{
            alert("Sayfa seçin")
        }
    }

    async addCropArea(){
        let BU = this
        if(this.activeCanvas){   
             new fabric.Image.fromURL(agBaseURL+BU.agImagePlaceHolder,
                    function(oImg) {
                        oImg.id             = Math.floor(Math.random() * 100000) + 1
                        oImg.left           = 200;
                        oImg.top            = 200;
                        oImg.agBosBirak     = false; 
                        oImg.strokeUniform  = true;
                        BU.activeCanvas.add(oImg);
                    }
                );           
        }else{
            alert("Sayfa seçin")
        }
    }

    async addLogo(imgElm){
        let BU = this;
        if(this.activeCanvas){ 
            fabric.Image.fromURL($(imgElm).attr('src'), function(oImg) {
                oImg.id = Math.floor(Math.random() * 100000) + 1
                oImg.strokeUniform = true;
                oImg.agIsLogo = true;
                BU.activeCanvas.add(oImg); 
            });
        }else{
            alert("Sayfa seçin")
        } 
    }

    async loadFont(font_name){  
        let junction_font = new FontFace(font_name, 'url('+agBaseURL+'/editor/fonts/'+font_name+'.ttf)');
        return  new Promise((resolve,reject)=>{
                        let fnt = junction_font.load() 
                        fnt.then((loaded_face)=>{
                            document.fonts.add(loaded_face)
                            resolve()
                        }).catch(()=>{
                            console.error("Font yüklenemedi. Font adı : "+ font_name)
                            resolve();
                        })
                    })
    }

    async drawObjectsBorder(canvas,show) { 
        if(this.presentMode==false){
            return;
        }
        if(this.drawObjectsBordered==false){
            let objects     = canvas.getObjects();
            $.each(objects,async function(j,obj){
                if(obj.agSablonResmi || obj.agIsLogo){return;}
                let borderRect = new fabric.Rect({
                    id      :'borderRect',
                    width   :obj.getScaledWidth(),
                    height  :obj.getScaledHeight(),
                    left    :obj.left,
                    top     :obj.top,
                    strokeUniform:true,
                    stroke  :'lightgreen',
                    strokeWidth :1,
                    hasControls : false,
                    evented : false,
                    angle   : obj.angle,
                    fill    :'rgba(255,255,255,0.4)'
                })
                canvas.add(borderRect);
            })
            this.drawObjectsBordered = true;
        }

        if(!show){
            let objects             = canvas.getObjects();
            $.each(objects,async function(j,obj){
                if(obj.id=='borderRect'){
                    canvas.remove(obj);
                }
                canvas.renderAll();
            })
            this.drawObjectsBordered = false;
        }
    }

    async removeObject(){
        if(this.activeCanvas.getActiveObject()){
            this.activeCanvas.remove(this.activeCanvas.getActiveObject());
        }else if(this.activeCanvas){
            let canvas_id = $(this.activeCanvas.lowerCanvasEl).attr('id');
            $(this.activeCanvas.wrapperEl).remove();
            await delete this.fabricCanvases[canvas_id];
            let kalanCnvslar = this.fabricCanvases.filter(function(i,val){
                if(val){return val }
            })
            this.fabricCanvases = kalanCnvslar
            if(!Object.keys(this.fabricCanvases).length){
                this.agBelgeTuru='varsayilan_belge'
            }
            if(this.workLocation!='product_page'){
                $('#'+this.activeCanvas.id).parent().css('outline','thick solid aqua');
            }
            this.activeCanvas = null;
        }
        
        this.refreshMainMenu();
    }

    updateControls(e){
        if(e.target instanceof fabric.Textbox){
            e.target.agMaxLines = e.target.textLines.length
        }

        this.BU.refreshPropertiesPanel(e.target);
    }
 
    async createObjects(page){
         await this._createObject(page,0)
    }

    async _createObject(page,index){
        let BU = this
        if(page.objects.hasOwnProperty(index)){
            return new Promise(async function(resolve,reject) {  
                let obje = page.objects[index]; 
                if(obje.type == 'Textbox'){ 
                    await BU.addTextArea();
                }else if(obje.type == 'CropBox'){
                    await BU.addCropArea();
                }
                index++;
                await BU._createObject(page,index);
                resolve('OK');
            })
        }
    }

    async _loadfonts(){
        let BU = this;
        $.get( agBaseURL+'/api/?command=getFontList', (fonts) =>{  
            BU.fontsJson = fonts;
        });
    }

    refreshPropertiesPanel(object){
        let TR              = null; 
        let object_type     = object.get('type');
        // -----------------------------------------------eğer obje bir image text yada crop ise
        if(object_type == 'rect' || object_type == 'text' || object_type == 'image'  || object_type == 'textbox'){            
            if(object_type == 'textbox'){
                TR    += this.propertiesPanelTR('textAlign','Text Align','select',object.textAlign,this.align)
                TR    += this.propertiesPanelTR('fontFamily','Font Family','select',object.fontFamily,this.fontsJson)
                TR    += this.propertiesPanelTR('fontSize','Font Size','number',object.fontSize)
                TR    += this.propertiesPanelTR('fontWeight','Font Weight','select',object.fontWeight,this.bolds)
                TR    += this.propertiesPanelTR('fontStyle','Italic','select',object.fontStyle,this.italics)
                TR    += this.propertiesPanelTR('fill','Fill','color',object.fill)
                TR    += this.propertiesPanelTR('stroke','Stroke','color',object.stroke)
                TR    += this.propertiesPanelTR('strokeWidth','Stroke Width','number',object.strokeWidth)
                TR    += this.propertiesPanelTR('agMaxLines','Satır Limiti','number',object.agMaxLines)
                TR    += this.propertiesPanelTR('agKarakterLimiti','Karakter Limiti','number',object.agKarakterLimiti)
                TR    += this.propertiesPanelTR('agKutuyaSigdir','Kutuya Sığdır','checkbox',object.agKutuyaSigdir)
            }else if(object_type == 'rect' || object_type == 'image'){
                TR    += this.propertiesPanelTR('brightness','Brightness','range',null,null,object)
                TR    += this.propertiesPanelTR('contrast','Contrast','range',null,null,object)
            }
            TR    += this.propertiesPanelTR('height','Height','number',object.getScaledHeight())
            TR    += this.propertiesPanelTR('width','Width','number',object.getScaledWidth())
            TR    += this.propertiesPanelTR('top','Top','number',object.top)
            TR    += this.propertiesPanelTR('left','Left','number',object.left)
            TR    += this.propertiesPanelTR('angle','Angle','number',object.angle)


            $(this.target_properties_panel).find('table').empty();
            $(this.target_properties_panel).find('table').append(TR);
        // ------------------------------------------------Eğer obje Canvas ise
        }else if(object instanceof fabric.Canvas){
            let TR = null;
            TR      += this.propertiesPanelTR('width','Width','number',object.width)
            TR      += this.propertiesPanelTR('height','Height','number',object.height)
            $(this.target_properties_panel).find('.properties').empty();
            $(this.target_properties_panel).find('.properties').append(TR);
        }
    }

    propertiesPanelTR(prop_name,label,type,value,data=null,object=null){
        let tr = null;
        if(type == 'number'){
            tr = '<tr>'
                +'  <td >'+label+'</td>'
                +'  <td>'
                +'      <input class="form-control prop-form-control" type="'+type+'" value="'+value+'" data-prop-name="'+prop_name+'">'
                +'  </td>'
                +'</tr>';
        }else if(type == 'checkbox'){
            let checked = null
            if(value){
                checked ="checked"
            }
            tr = '<tr>'
                +'  <td >'+label+'</td>'
                +'  <td>'
                +'      <input class="ag-checkbox" type="'+type+'" '+checked+' value="'+value+'" data-prop-name="'+prop_name+'">'
                +'  </td>'
                +'</tr>';
        }else if(type == 'select'){
            tr = '<tr>'
                +'<td>'+label+'</td>'
                +'  <td>'
                +'      <select class="form-control prop-form-control" data-prop-name="'+prop_name+'">'
                $.each(data,function (i,fv) {
                    let selected = fv==value?"selected":null;
                    tr +='      <option '+selected+' value="'+fv+'">'+i+'</option>'; 
                }) 
            tr +='      </select>'
                +'  </td>'
                +'</tr>'
        }else if(type == 'color'){
            tr = '<tr>'
                +'  <td >'+label+'</td>'
                +'  <td>'
                +'      <input class="prop-form-control" style="height:24px!important" type="'+type+'" value="'+value+'" data-prop-name="'+prop_name+'">'
                +'  </td>'
                +'</tr>';
        }else if(type == 'range'){
            if(object.filters.length){
                value = 0;
                if(prop_name == 'brightness' 
                        &&  typeof object.filters[0]!='undefined'){
                        value   =  object.filters[0].brightness
                }else if(prop_name == 'contrast'
                        &&  typeof object.filters[1]!='undefined'){
                        value   =  object.filters[1].contrast
                } 
            }
            tr = '<tr>'
            +'  <td >'+label+'</td>'
            +'  <td>'
            +'      <input class="form-control prop-form-control" type="'+type+'"' 
            +'      value="'+value+'" min="-1" max="1" step="0.0001" data-prop-name="'+prop_name+'">'
            +'  </td>'
            +'</tr>';        
        }
        return tr
    }

    async setObjectProperties(prop_name,value){
        if($.isNumeric(value)){
            value = parseFloat(value);
        }

        if(prop_name == 'agMaxLines'){
            let text='Satir 0';
            for(let satir = 0;satir<value-1;satir++){
                text += '\nSatir '+ (satir + 1)
            }
            this.activeCanvas.getActiveObject().text = text
        }else if(prop_name == 'fontFamily'){
            await this.loadFont(value.name);
            value = value.name
        }else if(prop_name == "brightness"){ 
            let filter = new fabric.Image.filters.Brightness({
                brightness: value
            });
            if(typeof this.activeCanvas.getActiveObject().filters[0] == 'undefined'){ 
                this.activeCanvas.getActiveObject().filters[0]=filter;  
            }
            if(this.activeCanvas.getActiveObject().filters[0].hasOwnProperty('brightness')){
                this.activeCanvas.getActiveObject().filters[0].brightness=value
            }

            this.activeCanvas.getActiveObject().applyFilters();
        }else if(prop_name == "contrast"){ 
            let filter = new fabric.Image.filters.Contrast({
                contrast: value
            });
            if(typeof this.activeCanvas.getActiveObject().filters[1] == 'undefined'){ 
                this.activeCanvas.getActiveObject().filters[1]=filter;  
            }
            if(this.activeCanvas.getActiveObject().filters[1].hasOwnProperty('contrast')){
                this.activeCanvas.getActiveObject().filters[1].contrast=value
            }

            this.activeCanvas.getActiveObject().applyFilters();
        }

        if(!this.activeCanvas.getActiveObject() && this.activeCanvas){
            if(prop_name=="width"){
                this.activeCanvas.setDimensions({width:value, height:this.activeCanvas.height});
            }else if(prop_name=="height"){
                this.activeCanvas.setDimensions({width:this.activeCanvas.width, height:value});
            }
            
        }else{
            if(prop_name == 'width'){
                value /= this.activeCanvas.getActiveObject().scaleX
            }
            if(prop_name == 'height'){
                value /= this.activeCanvas.getActiveObject().scaleY
            }
            this.activeCanvas.getActiveObject().set(prop_name, value);
            this.activeCanvas.requestRenderAll();            
        }
    }

    saveJsonToLocal(){
        let BU              = this
        let allCanvasesArr  = [{'agBelgeTuru':agEditor.agBelgeTuru}]; 
        for (var key in BU.fabricCanvases) {
            if (!BU.fabricCanvases.hasOwnProperty(key)) continue;
            let canvas = BU.fabricCanvases[key];
            //let serialized = JSON.stringify(canvas.toJSON(BU.agJsonExportOptions));
            //serialized = serialized.replace( new RegExp(/src\":\"data:image\/([a-zA-Z]*);base64,([^\"]*)\"/,"i"),"src\":\""+agBaseURL+'/'+BU.agImagePlaceHolder+"\"")
            let cnv         = canvas.toJSON(BU.agJsonExportOptions)
            $.each(cnv.objects,function(i,obj){
                if(!obj.agSablonResmi){
                    obj.src = agBaseURL+agEditor.agImagePlaceHolder
                }
            })
            allCanvasesArr.push(cnv) 
            //allCanvasesArr.push(canvas.toJSON(BU.agJsonExportOptions)) 
        }

        let a       = document.createElement('a');
        a.href      = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allCanvasesArr));
        a.download  = 'data.json';
        a.innerHTML = 'download JSON';
        a.click(); 
    }

    async _fromJSON(jsonFile){
        return new Promise((res,rej)=>{


            let BU              = this;
            $(this.editor_html_element).empty();
            this.fabricCanvases = [];
     
            let Promises = []
            $.each(jsonFile,async (i,val)=>{
                if(i==0){
                    return;
                }
                let Prms = new Promise(async(Resolve,reject)=>{
                    let obj     = val
                    let page    = {id:obj.id ,w:obj.width,h:obj.height,bgColor:"#ffffff"}
                    let cnvs    = await BU.addCanvas(page); 
                    if(jsonFile[0] !== undefined){
                        if(jsonFile[0].agBelgeTuru !== undefined ){
                            BU.agBelgeTuru = jsonFile[0].agBelgeTuru
                        }
                    }
                    cnvs.loadFromJSON(obj,async function() {
                        let cnv     = cnvs;
                        let objects = cnv.getObjects();
                        let promises =[]
                        $.each(objects,async function(j,obj){ 
                            let prms = new Promise(async(resolve,reject)=>{
                                    obj.evented         = true;
                                    obj.strokeUniform   = true;
                                    obj.hasControls     = true;
                                    if(obj instanceof fabric.Textbox){
                                        obj.setControlsVisibility({
                                            bl: false,
                                            br: false,
                                            tl: false,
                                            tr: false,
                                            mb: false,
                                            ml: true,
                                            mr: true,
                                            mt: false,
                                            mtr: true,
                                        });
                                        await BU.loadFont(obj.fontFamily).then(()=>{
                                            let txt = obj.text
                                            obj.text= "";
                                            cnv.renderAll() 
                                            if(BU.workLocation == 'product_page'){ 
                                                return;
                                            }
                                            obj.text = txt;
                                            cnv.renderAll() 
                                        });
                                    }
                                    if(obj instanceof fabric.Image && !obj.agSablonResmi){
                                        BU.agCropper.autoCrop(obj);
                                    }                    
                                    if(obj instanceof fabric.Image && obj.agSablonResmi){
                                        obj.evented     = false;
                                    }
                                    if(BU.workLocation == 'product_page'){
                                        obj.selectable  = false;
                                        if(obj.agIsLogo){
                                            obj.evented     = false;
                                        }
                                        obj.filters=[];
                                    }
                                    resolve(true);
                                }) 
                            promises.push(prms);
                        }); //end foreach
    
                        Promise.all(promises).then(() => {
                            BU.sunumuBaslat()
                            Resolve(true);
                        });
                    }) 
                })  // end Prms
                Promises.push(Prms);          
            })// foreah
    
            Promise.all(Promises).then((s) => {
                console.log("Tamam") 
                res();
            });
        })
    }
   
    getObjectByID(target_id){
        let objects = this.activeCanvas.getObjects();
        let obj = null;
        $.each(objects,function(i,o){
            if(o.id != undefined){
                if(o.id.toString() == target_id.toString()){
                    obj = o;
                    return;
                }
            }
        })
        return obj;
    }

    writeToText(target_id,text){
        let o           = this.getObjectByID(target_id);
        o.text          = text;
        this.activeCanvas.renderAll(); 
    }

    async sunumuBaslat(){
        this.presentMode = !this.presentMode;
        this.activeCanvas   = this.fabricCanvases[Object.keys(this.fabricCanvases)[0]];

        if(this.workLocation=='product_page'){
            this.presentMode    = true;
        }

        await this.agPresentation.prewiev();
        $(this.agPresentation.preview_input_panel).attr('data-canvas-id','')
        this.agPresentation.createInputPanel(this.activeCanvas)
        this.refreshMainMenu();
    }

    async renderWithBigBGImage(){
        let BU                              = this;
        let bigImgSrc,imgSrc
        if(BU.activeCanvas.imgSrc){
            bigImgSrc                       = BU.activeCanvas.imgSrc;
            BU.activeCanvas.imgSrc          = null;
        }else{
            imgSrc                          = BU.getObjectByID('bg').getSrc();
            bigImgSrc                       = imgSrc.replace("bgimages", "orginal_images");
            BU.activeCanvas.bigImgSrc       = bigImgSrc;
            BU.activeCanvas.imgSrc          = imgSrc;
            if(BU.activeCanvas.agBigImgSrc){
                BU.activeCanvas.bigImgSrc   = BU.activeCanvas.agBigImgSrc;
                bigImgSrc                   = BU.activeCanvas.bigImgSrc
            }
        }        
        
        if(this.activeCanvas){  
            return new Promise((resolve,reject)=>{
                fabric.Image.fromURL(bigImgSrc, function(oImg) {
                    if (!oImg._element){
                        alert("Büyük resim bu yolda bulunamadı \n"+bigImgSrc)
                        reject()
                        return;
                    }
                    let w0      = BU.activeCanvas.width;
                    let index   = BU.activeCanvas.getObjects()
                                    .indexOf(BU.getObjectByID('bg'))
                    BU.activeCanvas.remove(BU.getObjectByID('bg'))
                    oImg.id             = "bg"
                    oImg.lockMovementX  = oImg.lockMovementY = true;
                    oImg.hasControls    = false
                    oImg.evented        = false
                    oImg.agSablonResmi  = true  
                    BU.activeCanvas.add(oImg);
                    BU.activeCanvas.moveTo(oImg, index)
                    let scaleRatio      = oImg.width / w0
                    BU.activeCanvas.setDimensions({   
                            width: oImg.width , 
                            height: oImg.height  
                        })
                    scaleRatio=scaleRatio<1?1:scaleRatio;
                    BU.activeCanvas.setZoom(scaleRatio);
                    oImg.scaleX=1/scaleRatio
                    oImg.scaleY=1/scaleRatio
                    resolve(scaleRatio)
                });                 
            })
        }else{
            alert("Sayfa seçin")
        }

    }

    async downloadBigImage(){
        let BU = this;
        return new Promise(function(resolve,reject){
            let indirlink = document.createElement('a') 
            indirlink.href = BU.activeCanvas.toDataURL({
                format: 'jpg',
                quality: 1
            });
            indirlink.download = 'canvas.png'
            indirlink.click();   
            resolve();
        })     
    }

    async getJPEG(w,canvas){
        let ratio = w/canvas.width
        return canvas.toDataURL(
        {
            format: 'jpg', 
            multiplier: ratio,
        });  
    } 
}


////////////////////////////////////////  AGPRESENTATION /////////////////////////////////////
class AgPresentation{

    constructor(editor){
        this.editor                 = editor; 
        this.preview_input_panel    = editor.preview_input_panel;
    }

    async prewiev() {
        
        let BU = this;
        if(!Object.keys(this.editor.fabricCanvases).length){
            alert("Gösterilecek döküman yok")
            return;
        }

        this.presentMode            = this.editor.presentMode;
        this.presentMode?$(BU.preview_input_panel).show():$(BU.preview_input_panel).hide();
        this.presentMode?$(BU.editor.target_properties_panel).hide():$(BU.editor.target_properties_panel).show();

        for (var key in BU.editor.fabricCanvases) {
            if (!BU.editor.fabricCanvases.hasOwnProperty(key)) continue;
            let canvas      = BU.editor.fabricCanvases[key];
            let objects     = canvas.getObjects();
            $.each(objects,(i,o)=>{
                if(o instanceof fabric.Textbox){
                    o.editable = !BU.presentMode;
                }
                o.lockMovementX = o.lockMovementY = BU.presentMode;
                o.hasControls = !BU.presentMode;
            })
        }
        
    }

    createInputPanel(canvas){

        let BU = this;
        if(!this.presentMode){
            return;
        }

        let data_canvas_id = $(BU.preview_input_panel).attr('data-canvas-id')
        if(data_canvas_id == canvas.id)return;

        $(BU.preview_input_panel).find('.inputs').empty(); 
        $(BU.preview_input_panel).attr('data-canvas-id',canvas.id)
        let objects         = canvas.getObjects();
        let crop_count      = 0;
        $.each(objects,(i,o)=>{
            let style ='';
            let disabled = '';
            let checked = '';
            if(o.agBosBirak){
                disabled      = "disabled"
                checked       = "checked"
            }

            let  o_text         =   '';
            if(BU.workLocation  !=  'product_page'){
                o_text = o.text
                if(BU.editor.agBelgeTuru == 'tek_harfli_banner' ){
                    o_text = o.agTekHarfliBannerIcinKelime
                }
            }
            
            if(o instanceof fabric.Textbox){
                if(o.agMaxLines==1){
                    $(BU.preview_input_panel).find('.textbox')
                        .append('<tr>'
                            +'  <td style="padding:0px!important;padding-top:0px!important">'
                            +'      <div class="btn btn-primary btn-sm ag-edit-font" data-object-id="'+o.id+'"><i class="fa fa-font"></i> </div>'
                            +'  </td>'
                            +'  <td>'
                            +'      <input type="text" style="'+style+'"  class="form-control ag-form-control ag-textbox" placeholder="Yazı Alanı" value="'+o_text+'" '+disabled+'  data-target-id="'+o.id+'">'
                            +'  </td>'
                            +'  <td style="min-width: 92px; padding: 0!important; padding-top: 1px!important;">'
                            +'      <div class="btn btn-primary btn-sm ag-edit-font-size" data-object-id="'+o.id+'" data-val ="+"><i class="fa fa-plus"></i></div>'
                            +'      <div class="btn btn-primary btn-sm ag-edit-font-size ag-edit-font-size-icon"><i class="fa fa-font"></i></div>'
                            +'      <div class="btn btn-primary btn-sm ag-edit-font-size" data-object-id="'+o.id+'" data-val ="-"><i class="fa fa-minus"></i></div>'
                            +'  </td>'
                            +'</tr>'
                            +'<tr>'
                            +'  <td colspan="3">'
                            +'      <div class="checkbox" style="margin-top:0px">'
                            +'      <label> <input type="checkbox" class="bos-birak" data-canvas-id="'+canvas.id+'"  '+checked+' data-object-id="'+o.id+'">Yazı eklemek istemiyorum</label>'
                            +'      </div>'
                            +'  </td>'
                            +'</tr>')

                }else{
                    style           += "font-family:"+o.fontFamily+";"
                    style           += "font-size:"+o.fontSize*o.scaleX+"px!important;"
                    style           += "text-align:"+o.textAlign+";";
                    style           += "width:"+o.getScaledWidth()+"px;"
                    style           += "height:"+(o.fontSize*o.agMaxLines)+"px!important;"
                    style           += "padding:0px!important;"

                    let zoom        = $(BU.preview_input_panel).find('.inputs').width() / o.getScaledWidth();
                    let zoomstyle   = '';
                    if(zoom<1){
                        zoomstyle   = ";zoom:"+zoom
                    }

                    $(BU.preview_input_panel).find('.textbox')
                        .append('<tr>'
                        +'  <td style="padding:0px!important;padding-top:0px!important">'
                        +'      <div class="btn btn-primary btn-sm ag-edit-font" data-object-id="'+o.id+'"><i class="fa fa-font" ></i> </div>'
                        +'  </td>'
                        +'  <td style="display:block;overflow:auto'+zoomstyle+'">'
                        +'      <textarea rows="'+o.agMaxLines+'"  style="'+style+'"  class="ag-form-control form-control ag-textarea"  data-target-id="'+o.id+'"  maxlength="'+o.agKarakterLimiti+'">'+o.text+'</textarea>'
                        +'  </td>'
                        +'  <td style="min-width: 60px; padding: 0!important; padding-top: 1px!important;">'
                        +'      <div class="btn btn-primary btn-sm ag-edit-font-size" data-object-id="'+o.id+'" data-val ="+"><i class="fa fa-plus"></i></div>'
                        +'      <div class="btn btn-primary btn-sm ag-edit-font-size ag-edit-font-size-icon"><i class="fa fa-font"></i></div>'
                        +'      <div class="btn btn-primary btn-sm ag-edit-font-size" data-object-id="'+o.id+'" data-val ="-"><i class="fa fa-minus"></i></div>'
                        +'  </td>'
                        +'</tr>'
                        +'<tr>'
                        +'  <td colspan=3>'
                        +'      <div class="checkbox" style="margin-top:0px">'
                        +'      <label> <input type="checkbox" class="bos-birak" data-canvas-id="'+canvas.id+'"  '+checked+' data-object-id="'+o.id+'">Yazı eklemek istemiyorum</label>'
                        +'      </div>'
                        +'  <td>'
                        +'</tr>')
                }
            }

            if(o instanceof fabric.Image && !o.agSablonResmi && !o.agIsLogo){
                crop_count++;
                $(BU.preview_input_panel).find('.cropbox')
                .append('<tr>'
                    +'   <td>'
                    +'       <div  class="btn btn-primary  ag-resimekle-btn" data-target-id="'+o.id+'" '+disabled+'  ><i class="fa fa-camera" style="color:#fff"></i> Resim Ekle ' + crop_count +'</div>'
                    +'       <div class="checkbox" style="margin-top:0px">'
                    +'       <label> <input type="checkbox" class="bos-birak" id="bosbirak'+o.id+'"  '+checked+' data-object-id="'+o.id+'">Resim eklemek istemiyorum</label>'
                    +'       </div>'
                    +'   </td>'
                    +'</tr>')
            }
        })
        let bannerlereBakTR =''
        if(BU.editor.agBelgeTuru == 'tek_harfli_banner'){
            bannerlereBakTR = '\n<tr>'
                            + '  <td colspan="3">'
                            + '     <div class="btn btn-primary ag-bannerleri-gor pull-right">'
                            + '     <i class="fa fa-eye"></i>'
                            + '     Bannerleri Gör</div>'
                            + '  </td>'
                            + '</tr>'
            $(BU.preview_input_panel).find('.cropbox').append(
                bannerlereBakTR
            )
        }
    }
}



///////////////////////////////////////   AGCROPPER  ////////////////////////////////////////
class AgCropper{

    constructor(editor){
        this.awaitingUploads    = [];
        this.modal_element      = $('#modal-agcropper');
        this.targetObj          = null;
        this.editor             = editor;
        this.agImageUrl         = null;
        this.imageBase64Data    = null;
        this.cropper            = null;
    }

    async show(){
        $(this.modal_element).modal('toggle');
        $(this.modal_element).find(".crop-menu-item").hide();
    }

    async openForCrop(){
        $(this.modal_element).find(".crop-menu-item").show();
        $(this.modal_element).find(".ag-crop-resim-resimlerim").show();
        $(this.modal_element).find(".ag-crop-resim-yukle").hide();
        const userImage = document.createElement("img"); 
        if(this.imageBase64Data){
            userImage.setAttribute('src', this.imageBase64Data);
        }else{
            userImage.setAttribute('src', this.agImageUrl);
        }
        userImage.setAttribute('style', "max-height:100%;position:absolute");
        $(this.modal_element).find('.modal-body').empty();
        $(this.modal_element).find('.modal-body').append(userImage);

        const options   ={
                            aspectRatio: this.targetObj.getScaledWidth()  / this.targetObj.getScaledHeight(),
                            viewMode:1,
                            zoomable:false,
                            ready:()=>{
                                this.cropper.setData(this.targetObj.agCropData);
                            }
                        }
        this.cropper   = new Cropper(userImage,options); 
    }

    async showMyImages(){
        let BU = this
        $(this.modal_element).find('.modal-body').empty();
        $(this.modal_element).find('.modal-body').append(
                '<div style="text-align: center;padding: 50px;">'+
                    '<p style="display: block;">Henüz hiç resminiz yok.</p>'+
                    '<div   class="btn btn-link ag-crop-resim-yukle">Resim Yükle</div>'+
                '</div>'
            );

        if(window.localStorage.getItem('localresimlerim')){
            let  localresimlerim = JSON.parse(window.localStorage.getItem("localresimlerim"));
            if(localresimlerim && Object.keys(localresimlerim).length){
                this.editor.modal_progress.modal('show');
                $(this.modal_element).find('.modal-body').empty();
            }
            
            let sayac = 0;
            $.each(localresimlerim,(i,resim)=>{
                let img         = document.createElement("img");
                img.setAttribute('src',resim.url)
                img.className   ="user-image";
                img.onload      = function(){
                    if(sayac == Object.keys(localresimlerim).length-1){
                        BU.editor.modal_progress.modal('hide');
                    }
                    sayac++
                }
                img.onerror  = function(){
                    BU.editor.modal_progress.modal('hide'); 
                    $("[data-lcl-ctoreage-id="+i+"]").trigger('click')
                }

                let div         = document.createElement("div"); 
                div.className   = "wrap-user-image";
                $(div).append(img);
                $(div).append('<i class="fa fa-trash" data-lcl-ctoreage-id='+i+'></i>'); 
                $(this.modal_element).find('.modal-body').append(div);
                
            });
        }
    }

    async rotateLeft(){
        this.cropper.rotate(-90)
    }

    async rotateRight(){
        this.cropper.rotate(90)
    }

    async crop(){
        let BU = this;
        let base64 = this.cropper.getCroppedCanvas({
            width: BU.targetObj.getScaledWidth()*3,
            height: BU.targetObj.getScaledHeight()*3,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
          }).toDataURL();  
         
        BU.targetObj.setSrc(base64  , function(img) { 
            img.scaleX  = 1/3
            img.scaleY  = 1/3
            BU.editor.activeCanvas.renderAll();
            $(BU.modal_element).modal('toggle');
            BU.targetObj.agCropImageData    = BU.cropper.getImageData();
            BU.targetObj.agCropData         = BU.cropper.getData();
            BU.targetObj.agImageUrl         = BU.agImageUrl; 
        });
         
 
    }

    async autoCrop(obj){
        let BU              = this;
        let agImageUrl      = obj.agImageUrl 
        let tmpcropper      = {}
        let image           = new Image() 
        image.id            = obj.id
        image.src           = agImageUrl;
        image.setAttribute('style',"display:none")
        $('#modal-agcropper').append(image);
        image.onload        = async function(){   
            const options   ={
                aspectRatio: obj.agCropData.width  / obj.agCropData.height,
                viewMode:2,
                zoomable:false,
                ready: async function() {
                    tmpcropper[obj.id].setData(obj.agCropData);
                    await BU._kirpYerlestir(tmpcropper[obj.id],obj);
                }
            }
            tmpcropper[obj.id] = new Cropper(document.getElementById(obj.id),options);
        }
    }

    async _kirpYerlestir(tmpcropper,obj){
        let BU      = this;
        let base64  = tmpcropper.getCroppedCanvas({
            width: obj.getScaledWidth()*3,
            height: obj.getScaledHeight()*3,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
          }).toDataURL('image/jpeg',1);  

        obj.setSrc(base64  , function(img) { 
            img.scaleX  = 1/3
            img.scaleY  = 1/3
            BU.editor.activeCanvas.renderAll();
            //let elm = document.getElementById(obj.id);
            //$('#modal-agcropper').remove(elm);
            tmpcropper.destroy();
        }); 
    }
}
