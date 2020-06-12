class AgEditor {

    constructor(){
        this.agPresentation      = new AgPresentation(this);
        this.agCropper           = new AgCropper(this);
        this.scale               = 1;
        this.agdocument          = null;
        this.target_html_element = $('#ageditor');
        this.target_properties_panel= $('#properties-panel');
        this.fabricCanvases      = [];
        this.activeCanvas        = null;
        //this.textBoxJson         = null;
        this.presentMode         = false;
        this.fontsJson           = null;
        this.bolds               = {normal:"Normal",bold:"Bold"}
        this.italics             = {normal:"Normal",italic:"Italic"}
        this.align               = {"Left":"left"
                                    ,"Center":"center"
                                    ,"Right":"right"
                                    ,"Justify":"justify"
                                    ,"Justify Left":"justify-left"
                                    ,"Justify Center":"justify-center"
                                    ,"Justify Right":"justify-right"}
        this.fabricCanvases      = [];
        this._loadfonts();
    }

    async setPageBgImage(imgElm){
        let BU = this;
        if(this.activeCanvas){  
            this.activeCanvas.setHeight($(imgElm).get(0).naturalHeight);
            this.activeCanvas.setWidth($(imgElm).get(0).naturalWidth);
            fabric.Image.fromURL($(imgElm).attr('src'), function(oImg) {
                oImg.lockMovementX  = oImg.lockMovementY = true;
                oImg.hasControls    = false
                oImg.evented        = false
                oImg.agSablonResmi  = true  
                BU.activeCanvas.add(oImg);
                BU.activeCanvas.moveTo(oImg, 0) 
            }); 
        }else{
            alert("Sayfa seçin")
        }
    }

    async addTextArea(){
        let BU = this;
        if(this.activeCanvas){
            let textBoxFabricInstance =   new fabric.Textbox('Yazı Alanı', 
            {
                id:             Math.floor(Math.random() * 100000) + 1,
                fontFamily:     "arial",
                left:           100,
                top:            100, 
                width:          200,
                fontSize:       24*this.scale,
                fill:           "#000000",
                textAlign:      "left",
                stroke:         "#ffffff",
                strokeWidth:    0,
                strokeLineJoin: "round",
                textAlign:      "center",
                centeredRotation: true,
                angle:          0
            });
            await this.loadFont(textBoxFabricInstance.fontFamily);
            textBoxFabricInstance.agKarakterLimiti      = 30
            textBoxFabricInstance.agKutuyaSigdir        = 1
            BU.activeCanvas.add(textBoxFabricInstance);
            BU.activeCanvas.requestRenderAll();
            
        }else{
            alert("Sayfa seçin")
        }
    }

    async loadFont(font_name){  
        let junction_font = new FontFace(font_name, 'url(editor/fonts/'+font_name+'.ttf)');
        return  new Promise((resolve,reject)=>{
                        let fnt = junction_font.load() 
                        fnt.then((loaded_face)=>{
                            document.fonts.add(loaded_face)
                            resolve()
                        }).catch((err)=>{
                            console.error("Font yüklenemedi------------ \n"+err)
                            reject(err);
                        })
                    })
    }

    async addCropArea(){
        let BU = this
        if(this.activeCanvas){   
             new fabric.Image.fromURL("editor/agblank.png",
                    function(oImg) {
                        oImg.id = Math.floor(Math.random() * 100000) + 1
                        oImg.left = 200
                        oImg.top = 200
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
                BU.activeCanvas.add(oImg); 
            });
        }else{
            alert("Sayfa seçin")
        } 
    }

    async addCanvas(page){
        let BU = this;
        return new Promise(async (resolve,reject)=> {
            if(!page){
                page    = {id:Math.floor(Math.random() * 100000) + 1,w:600,h:700,bgColor:"#ffffff"}
            }
            let id      = page.id;
            let w       = page.w;
            let h       = page.h;
            let bgColor = page.bgColor;

            $(BU.target_html_element).append('<canvas id="'
                                                + id + '" width="'
                                                + w  * BU.scale + '"  height="'
                                                + h  * BU.scale + '"></canvas>');
            $(BU.target_html_element).append('<div class="clear"></div');
            let canvas      = new fabric.Canvas(id.toString(),{backgroundColor:bgColor});
            canvas.width    = w  * BU.scale;
            canvas.height   = h  * BU.scale;
            canvas.id       = id;
            canvas.selection = false
            canvas.on("mouse:down", (e)=>{
                BU.agPresentation.createInputPanel(canvas);
                if(BU.activeCanvas){
                    $(BU.activeCanvas.wrapperEl).css('outline','none');
                }
                BU.activeCanvas = canvas;
                $('#'+id).parent().css('outline','thick solid aqua');
                if(!e.target){
                    BU._refreshInputPanel(canvas); 
                }else{
                    BU._refreshInputPanel(e.target);
                    if(BU.presentMode == true && e.target instanceof fabric.Image && !e.target.agSablonResmi){
                        let target_id           = e.target.id
                        $(BU.target_properties_panel).hide();
                        BU.agCropper.targetObj  = BU.getObjectByID(target_id)
                        BU.agCropper.show()
                        BU.agCropper.showMyImages()
                    } 
                }
            });
            canvas.BU = this
            canvas.on({
                'object:moving': this.updateControls,
                'object:scaling': this.updateControls,
                'object:resizing': this.updateControls,
                'object:rotating': this.updateControls
                });
            BU.fabricCanvases[id] = canvas; 
            if(BU.activeCanvas){
                $(BU.activeCanvas.wrapperEl).css('outline','none');
            }
            BU.activeCanvas = canvas;
            resolve(canvas);
        })
    }

    removeObject(){
        if(this.activeCanvas.getActiveObject()){
            this.activeCanvas.remove(this.activeCanvas.getActiveObject());
        }else if(this.activeCanvas){
            let canvas_id = $(this.activeCanvas.lowerCanvasEl).attr('id');
            $(this.activeCanvas.wrapperEl).remove();
            delete this.fabricCanvases[canvas_id];
            this.activeCanvas = null;
        }
    }

    updateControls(e){
        this.BU._refreshInputPanel(e.target);
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
        $.get( "editor/fonts/fonts.json", (fonts) =>{  
            this.fontsJson = fonts;
        });
    }

    _refreshInputPanel(object){
        let TR              = null; 
        let object_type     = object.get('type');
        // -----------------------------------------------eğer obje bir image text yada crop ise
        if(object_type == 'rect' || object_type == 'text' || object_type == 'image'  || object_type == 'textbox'){
            
            if(object_type == 'textbox'){
                TR    += this._inputPanelTR('textAlign','Text Align','select',object.textAlign,this.align)
                TR    += this._inputPanelTR('fontFamily','Font Family','select',object.fontFamily,this.fontsJson)
                TR    += this._inputPanelTR('fontSize','Font Size','number',object.fontSize)
                TR    += this._inputPanelTR('fontWeight','Font Weight','select',object.fontWeight,this.bolds)
                TR    += this._inputPanelTR('fontStyle','Italic','select',object.fontStyle,this.italics)
                TR    += this._inputPanelTR('fill','Fill','color',object.fill)
                TR    += this._inputPanelTR('stroke','Stroke','color',object.stroke)
                TR    += this._inputPanelTR('strokeWidth','Stroke Width','number',object.strokeWidth)
                TR    += this._inputPanelTR('textLines','Satır Limiti','number',object.textLines.length)
                TR    += this._inputPanelTR('agKarakterLimiti','Karakter Limiti','number',object.agKarakterLimiti)
                TR    += this._inputPanelTR('agKutuyaSigdir','Kutuya Sığdır','checkbox',object.agKutuyaSigdir)
            }else if(object_type == 'rect' || object_type == 'image'){
               /// TR    += this._inputPanelTR('height','Height','number',object.getScaledHeight())
            }
            TR    += this._inputPanelTR('height','Height','number',object.getScaledHeight())
            TR    += this._inputPanelTR('width','Width','number',object.getScaledWidth())
            TR    += this._inputPanelTR('top','Top','number',object.top)
            TR    += this._inputPanelTR('left','Left','number',object.left)
            TR    += this._inputPanelTR('angle','Angle','number',object.angle)


            $(this.target_properties_panel).find('table').empty();
            $(this.target_properties_panel).find('table').append(TR);
        // ------------------------------------------------Eğer obje Canvas ise
        }else if(object instanceof fabric.Canvas){
            let TR = null;
            TR      += this._inputPanelTR('width','Width','number',object.width)
            TR      += this._inputPanelTR('height','Height','number',object.height)
            $(this.target_properties_panel).find('.properties').empty();
            $(this.target_properties_panel).find('.properties').append(TR);
        }
    }

    _inputPanelTR(prop_name,label,type,value,data=null){
        let tr = null;
        if(type == 'number'){
            tr = '<tr>'
                +'  <td >'+label+'</td>'
                +'  <td>'
                +'      <input class="form-control" type="'+type+'" value="'+value+'" data-prop-name="'+prop_name+'">'
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
                +'      <select class="form-control" data-prop-name="'+prop_name+'">'
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
                +'      <input class="form-control" style="height:24px!important" type="'+type+'" value="'+value+'" data-prop-name="'+prop_name+'">'
                +'  </td>'
                +'</tr>';
        }
        return tr
    }

    async setObjectProperties(prop_name,value){
        if($.isNumeric(value)){
            value = parseFloat(value);
        }

        if(prop_name == 'textLines'){
            let text='Satir 0';
            for(let satir = 0;satir<value-1;satir++){
                text += '\nSatir '+ (satir + 1)
            }
            this.activeCanvas.getActiveObject().text = text
        }else if(prop_name == 'fontFamily'){
            await this.loadFont(value.name);
            value = value.name
        }

        if(!this.activeCanvas.getActiveObject() && this.activeCanvas){
            if(prop_name=="width"){
                this.activeCanvas.setDimensions({width:value, height:this.activeCanvas.height});
            }else if(prop_name=="height"){
                this.activeCanvas.setDimensions({width:this.activeCanvas.width, height:value});
            }
            
        }else{
            this.activeCanvas.getActiveObject().set(prop_name, value);
            this.activeCanvas.requestRenderAll();            
        }
    }

    saveJsonToLocal(){
        let BU = this
        let allCanvasesArr=[];
        for (var key in BU.fabricCanvases) {
            if (!BU.fabricCanvases.hasOwnProperty(key)) continue;
            let canvas = BU.fabricCanvases[key];
            let serialized = JSON.stringify(canvas.toJSON([ "agSablonResmi",
                                                            "agKarakterLimiti",
                                                            "agKutuyaSigdir",
                                                            "agCropImageData",
                                                            "agCropData",
                                                            "agImageUrl",
                                                            "evented",
                                                            "hasControls",
                                                            "height",
                                                            "width",
                                                            "id"
                                                        ]));
            //let kalip = "/src\":\"data:image\/([a-zA-Z]*);base64,([^\"]*)\"/g";
            //serialized.replace(kalip, "------------");            
            serialized = serialized.replace( new RegExp(/src\":\"data:image\/([a-zA-Z]*);base64,([^\"]*)\"/,"i"),"src\":\"editor/agblank.png\"")

            
            
            console.log(serialized);
            allCanvasesArr.push(serialized) 
        }

        let a       = document.createElement('a');
        a.href      = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allCanvasesArr));
        a.download  = 'data.json';
        a.innerHTML = 'download JSON';
        a.click(); 
        //console.log(JSON.stringify(allCanvasesArr));
    }

    async openJsonFromLocal(){
        let BU          = this;
        let fileslct    = document.createElement("INPUT");
        fileslct.setAttribute("type", "file");
        fileslct.click();
        return new Promise((resolve,reject)=>{
            $(fileslct).change(function(){
                let file        = $(this)[0].files[0]
                let reader      = new FileReader();
                reader.readAsText(file);
                reader.onload   = async function() {
                    await BU._fromJSON(reader.result);
                    resolve();
                };
                reader.onerror  = function() {
                    console.error(reader.error);
                    reject();
                };
            })
        })
    } 

    async _fromJSON(stringFile){
        let BU              = this;
        let jsonFile        = JSON.parse(stringFile);
        $(this.target_html_element).empty();
        this.fabricCanvases = [];
        $.each(jsonFile,async (i,val)=>{
            let obj     = JSON.parse(val)
            let page    = {id:obj.id ,w:obj.width,h:obj.height,bgColor:"#ffffff"}
            let cnvs    = await BU.addCanvas(page);
            cnvs.loadFromJSON(val,async function() {
                let cnv     = cnvs;
                let objects = cnv.getObjects();
                $.each(objects,async function(j,obj){
                    if(obj instanceof fabric.Textbox){
                        await BU.loadFont(obj.fontFamily).then(()=>{
                            let txt = obj.text
                            obj.text=" ";
                            cnv.renderAll()
                            obj.text=txt;
                            cnv.renderAll()
                        });
                    }
                })
            })            
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
        let o   = this.getObjectByID(target_id);
        o.text  = text ;
        this.activeCanvas.renderAll();
    }

    async sunumuBaslat(){
        this.presentMode = !this.presentMode;
        await this.agPresentation.prewiev();
        $(this.agPresentation.preview_input_panel).attr('data-canvas-id','')
        for (var key in this.fabricCanvases) {
            this.agPresentation.createInputPanel(this.fabricCanvases[key])
            break;
        }
    }
}


////////////////////////////////////////  AGPRESENTATION /////////////////////////////////////
class AgPresentation{
    constructor(editor){
        this.editor                 = editor; 
        this.preview_input_panel    = $('#preview-input-panel');
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
                    o.editable = BU.presentMode;
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
        if(data_canvas_id==canvas.id)return;

        $(BU.preview_input_panel).find('.inputs').empty();
        $(BU.preview_input_panel).attr('data-canvas-id',canvas.id)
        let objects     = canvas.getObjects();
        let crop_count = 0;
        $.each(objects,(i,o)=>{
            if(o instanceof fabric.Textbox){  
                let style        = "font-family:"+o.fontFamily+";";
                style           += "text-align:"+o.textAlign+";";
                if(o.textLines.length==1){
                    $(BU.preview_input_panel).find('.inputs')
                    .append('<tr>'
                        +'  <td>'
                        +'      <input type="text" style="'+style+'" class="form-control ag-textbox" data-target-id="'+o.id+'" maxlength="'+o.agKarakterLimiti+'" value="'+o.text+'" >'
                        +'  </td>'
                        +'</tr>')
                }else{
                    $(BU.preview_input_panel).find('.inputs')
                    .append('<tr>'
                        +'  <td>'
                        +'      <textarea rows="'+o.textLines.length+'"  style="'+style+'"  class="form-control ag-textarea"  data-target-id="'+o.id+'"  maxlength="'+o.agKarakterLimiti+'">'+o.text+'</textarea>'
                        +'  </td>'
                        +'</tr>')
                }

            }

            if(o instanceof fabric.Image && !o.agSablonResmi){
                crop_count++;
                $(BU.preview_input_panel).find('.inputs')
                .append('<tr>'
                    +'  <td>'
                    +'      <input type="button" class="btn btn-primary ag-resimekle-btn" data-target-id="'+o.id+'"  value="Resim Ekle ' + crop_count +'" >'
                    +'  </td>'
                    +'</tr>')
            }
        })
    }
}




///////////////////////////////////////   AGCROPPER  ////////////////////////////////////////
class AgCropper{

    constructor(editor){
        this.awaitingUploads    = [];
        this.modal_element      =$('#modal-agcropper');
        this.targetObj          = null;
        this.editor             = editor;
        this.agImageUrl           = null;
        this.imageBase64Data    = null;
        this.cropper            = null;
    }

    async show(){
        $(this.modal_element).modal('toggle');
        $(this.modal_element).find(".crop-menu-item").hide();
    }

    async openForCrop(){
        $(this.modal_element).find(".crop-menu-item").show();
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
                        }
        this.cropper   = new Cropper(userImage,options); 
    }

    async showMyImages(){
        $(this.modal_element).find('.modal-body').empty();
        $(this.modal_element).find('.modal-body').append(
                                                            '<div style="width: 100%;text-align: center;padding: 50px;">'+
                                                                '<p style="display: block;">Henüz hiç resminiz yok.</p>'+
                                                                '<div style="display: block;" class="btn btn-link ag-crop-resim-yukle">Resim Yükle</div>'+
                                                            '</div>'
                                                        );

        if(window.localStorage.getItem('localresimlerim')){
            let  localresimlerim = JSON.parse(window.localStorage.getItem("localresimlerim"));
            $(this.modal_element).find('.modal-body').empty();
            $.each(localresimlerim,(i,resim)=>{
                let img = document.createElement("img");
                img.setAttribute('src',resim.url)
                img.className ="user-image";
                $(this.modal_element).find('.modal-body').append(img);
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
            width: BU.targetObj.width,
            height: BU.targetObj.height,
            imageSmoothingEnabled: false,
            imageSmoothingQuality: 'high',
          }).toDataURL();  
         
        let w0 = BU.targetObj.width;
        let h0 = BU.targetObj.height;
        BU.targetObj.setSrc(base64  , function(img) {
            BU.targetObj.width      = w0; 
            BU.targetObj.height     = h0;
            BU.editor.activeCanvas.renderAll();
            $(BU.modal_element).modal('toggle');
            BU.targetObj.agCropImageData    = BU.cropper.getImageData();
            BU.targetObj.agCropData         = BU.cropper.getData();
            BU.targetObj.agImageUrl         = BU.agImageUrl; 
        });
 
    }

}