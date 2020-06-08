class AgEditor {

    constructor(){
        this.agPresentation      = new AgPresentation(this);
        this.scale               = 1;
        this.agdocument          = null;
        this.target_html_element = $('#ageditor');
        this.target_properties_panel= $('#properties-panel');
        this.fabricCanvases      = [];
        this.activeCanvas        = null;
        this.textBoxJson         = null;
        this.logoBoxJson         = null;
        this.cropBoxJson         = null;
        this.presentMode         = true;
        this.fontsJson           = null;
        this._loadTextBoxJson();
        this._loadCropBoxJson();
        this._loadLogoBoxJson();
        this._loadfonts();
        //this.fonts               = {arial:"Arial"}
        this.bolds               = {normal:"Normal",bold:"Bold"}
        this.italics             = {normal:"Normal",italic:"Italic"}
        this.align               = {"Left":"left"
                                    ,"Center":"center"
                                    ,"Right":"right"
                                    ,"Justify":"justify"
                                    ,"Justify Left":"justify-left"
                                    ,"Justify Center":"justify-center"
                                    ,"Justify Right":"justify-right"}
    }

    async createPages(agdocument){
        this.fabricCanvases      = [] 
        this.agdocument          = agdocument;
        await this._createCanvas(0); 
    }

    async empty() { 
        $(this.target_html_element).empty();
    }

    async setPageBgImage(imgElm){
        let BU = this;
        
        if(this.activeCanvas){  
            this.activeCanvas.setHeight($(imgElm).get(0).naturalHeight);
            this.activeCanvas.setWidth($(imgElm).get(0).naturalWidth);
            fabric.Image.fromURL($(imgElm).attr('src'), function(oImg) {
                oImg.lockMovementX = oImg.lockMovementY = true;
                oImg.hasControls = false
                oImg.evented = false
                oImg.agSablonResmi = true; 
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
            let textBoxFabricInstance = await this.getTextBoxFabricInstance();
            await this.loadFont(textBoxFabricInstance.fontFamily);
            textBoxFabricInstance.top = (Math.floor(Math.random() * 300) + 1)
            textBoxFabricInstance.setControlVisible('tl',false)
            textBoxFabricInstance.setControlVisible('mt',false)
            textBoxFabricInstance.setControlVisible('tr',false)
            textBoxFabricInstance.setControlVisible('bl',false)
            textBoxFabricInstance.setControlVisible('mb',false)
            textBoxFabricInstance.setControlVisible('br',false)
            textBoxFabricInstance.agKarakterLimiti  = 30
            textBoxFabricInstance.kutuyaSigdir      = 1
            BU.activeCanvas.add(textBoxFabricInstance);
            BU.activeCanvas.requestRenderAll();
            
        }else{
            alert("Sayfa seçin")
        }
    }

    async loadFont(font_name){ 
        let junction_font = new FontFace(font_name, 'url(editor/fonts/'+font_name+'.ttf)');
       return  new Promise((resolve,reject)=>{
            junction_font.load().then((loaded_face)=>{
                document.fonts.add(loaded_face)
                resolve(loaded_face);
            }).catch((error)=> { 
                resolve(error);
            });
        })
    }

    async addCropArea(){
        if(this.activeCanvas){  
            let cropBoxFabricInstance   = await this.getCropBoxFabricInstance();
            cropBoxFabricInstance.top   = (Math.floor(Math.random() * 300) + 1)
            this.activeCanvas.add(cropBoxFabricInstance);
        }else{
            alert("Sayfa seçin")
        }
    }

    async addLogo(imgElm){
        if(this.activeCanvas){ 
            await this.getLogoBoxFabricInstance(imgElm); 
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
                    BU._refreshMenu();
                    BU._refreshInputPanel(canvas); 
                }else{
                    BU._refreshMenu();
                    BU._refreshInputPanel(e.target);
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
            resolve();
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

    async _createCanvas(index){
        let BU = this
        if(this.agdocument.pages.hasOwnProperty(index)){
            let page = this.agdocument.pages[index];
            return new Promise(async (resolve,reject)=> {
                await BU.addCanvas(page,index);
                await BU.createObjects(page);
                index++;
                await BU._createCanvas(index);
                resolve();
            })
        }
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

    async _loadTextBoxJson(){
        let BU = this;
        $.get( "editor/sablonlar/textbox.json", (textbox) =>{  
            this.textBoxJson = textbox;
        });
    }

    async getTextBoxFabricInstance(){
        return new Promise((resolve,reject)=>{
            let txt =   new fabric.Textbox(this.textBoxJson.defaultText, 
                {
                    id:             this.textBoxJson.id,
                    fontFamily:     this.textBoxJson.fontFamily,
                    left:           this.textBoxJson.left*this.scale,
                    top:            this.textBoxJson.top*this.scale, 
                    width:          this.textBoxJson.width*this.scale,
                    height:         this.textBoxJson.height*this.scale,
                    fixedWidth:     this.textBoxJson.fixedWidth,   
                    fixedFontSize:  this.textBoxJson.fixedFontSize,
                    fontSize:       this.textBoxJson.fontSize*this.scale,
                    fill:           this.textBoxJson.fill,
                    textAlign:      this.textBoxJson.textAlign,
                    stroke:         this.textBoxJson.stroke,
                    strokeWidth:    this.textBoxJson.strokeWidth,
                    strokeLineJoin: this.textBoxJson.strokeLineJoin,
                    centeredRotation: true,
                    angle:          this.textBoxJson.angle
                });  
                resolve(txt);  
        })        
    }

    async _loadCropBoxJson(){
        let BU = this;
        $.get( "editor/sablonlar/croparea.json", (cropbox) =>{  
            this.cropBoxJson = cropbox;
        });
    }

    async getCropBoxFabricInstance(){
        return new Promise((resolve,reject)=>{
            let box = new fabric.Rect( 
                {
                    id:         this.cropBoxJson.id,
                    fontFamily: this.cropBoxJson.fontFamily,
                    left:       this.cropBoxJson.left*this.scale,
                    top:        this.cropBoxJson.top*this.scale, 
                    width:      this.cropBoxJson.width*this.scale,
                    height:     this.cropBoxJson.height*this.scale,
                    fixedWidth: this.cropBoxJson.fixedWidth,   
                    fixedFontSize: this.cropBoxJson.fixedFontSize,
                    fontSize:   this.cropBoxJson.fontSize*this.scale,
                    fill:       this.cropBoxJson.fill,
                    cropArea:   this.cropBoxJson.cropArea,
                    stroke:     this.cropBoxJson.stroke,
                    centeredRotation: true,
                    angle:      this.cropBoxJson.angle
                });
            resolve(box)
        })
    }

    async _loadLogoBoxJson(){
        let BU = this;
        $.get( "editor/sablonlar/logobox.json", (logobox) =>{  
            this.logoBoxJson = logobox;
        });
    }

    async _loadfonts(){
        let BU = this;
        $.get( "editor/sablonlar/fonts.json", (fonts) =>{  
            this.fontsJson = fonts;
        });
    }

    async getLogoBoxFabricInstance(imgElm){
        return new Promise((resolve,reject)=>{
            let BU = this
            fabric.Image.fromURL($(imgElm).attr('src'), function(oImg) {
                oImg.id = Math.floor(Math.random() * 100000) + 1
                BU.activeCanvas.add(oImg);
                resolve();
            });
        })
    }

    _refreshMenu () { 
        if(this.activeCanvas==null){
            $('.navbar-nav .nav-link').hide();
        }else{
            $('.navbar-nav .nav-link').show();
        }
    }

    _refreshInputPanel(object){
        let TR              = null; 
        let object_type     = object.get('type');
        // -----------------------------------------------eğer obje bir image text yada rect ise
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
                TR    += this._inputPanelTR('kutuyaSigdir','Kutuya Sığdır','checkbox',object.kutuyaSigdir)
            }else if(object_type == 'rect'){
                TR    += this._inputPanelTR('height','Height','number',object.height)
            }

            TR    += this._inputPanelTR('width','Width','number',object.width)
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
            let loadfont = new Promise((resolve,reject)=>{
                let junction_font = new FontFace(value.name, 'url(editor/fonts/'+value.font_file+'.ttf)');
                junction_font.load().then(function(loaded_face) {
                    document.fonts.add(loaded_face)
                    resolve();
                }).catch(function(error) {
                    alert(error)
                    reject();
                });
            })
            await loadfont;
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
            let serialized = JSON.stringify(canvas.toJSON(["agSablonResmi",
                                                            "agKarakterLimiti",
                                                            "evented",
                                                            "hasControls",
                                                            "height",
                                                            "width",
                                                            "id"
                                                        ]));
            allCanvasesArr.push(serialized) 
        }
        console.log(allCanvasesArr); 

        let a       = document.createElement('a');
        a.href      = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allCanvasesArr));
        a.download  = 'data.json';
        a.innerHTML = 'download JSON';
        a.click(); 
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
                reader.onload   = function() {
                    BU._fromJSON(reader.result);
                    resolve();
                };
                reader.onerror  = function() {
                    console.log(reader.error);
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
            let obj = JSON.parse(val)
            let page    = {id:obj.id ,w:obj.width,h:obj.height,bgColor:"#ffffff"}
            await BU.addCanvas(page);
            
            $.each(obj.objects,async function(a,obj){
                if(obj.fontFamily){
                    await BU.loadFont(obj.fontFamily);
                    //BU.activeCanvas.loadFromJSON(val)
                    //BU.activeCanvas.renderAll.bind(BU.activeCanvas); 
                }
            })
 
            //if(!obj.fontFamily){
                BU.activeCanvas.loadFromJSON(val)
                BU.activeCanvas.renderAll.bind(BU.activeCanvas); 
            //}
        })
    }

    getObjectByID(target_id){
        let objects = this.activeCanvas.getObjects();
        let obj = null;
        $.each(objects,function(i,o){
            if(o.id.toString() == target_id.toString()){
                obj = o;
                return;
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
        this.agPresentation.prewiev();
    }
}


class AgPresentation{
    constructor(ageditor){
        this.ageditor            = ageditor; 
        this.preview_input_panel = $('#preview-input-panel');
        this.presentMode         = false;
    }

    prewiev() {
        this.presentMode = !this.presentMode
        let BU = this;
        if(!Object.keys(this.ageditor.fabricCanvases).length){
            alert("Gösterilecek döküman yok")
            return;
        }

        this.presentMode?$(BU.preview_input_panel).show():$(BU.preview_input_panel).hide();
        this.presentMode?$(BU.ageditor.target_properties_panel).hide():$(BU.ageditor.target_properties_panel).show();

        for (var key in BU.ageditor.fabricCanvases) {
            if (!BU.ageditor.fabricCanvases.hasOwnProperty(key)) continue;
            let canvas      = BU.ageditor.fabricCanvases[key];
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

        $(BU.preview_input_panel).find('.inputs').empty();
        let objects     = canvas.getObjects();

        let rect_count = 0;
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

            if(o instanceof fabric.Rect){
                rect_count++;
                $(BU.preview_input_panel).find('.inputs')
                .append('<tr>'
                    +'  <td>'
                    +'      <input type="button" class="btn btn-primary ag-resimekle-btn" data-target-id="'+o.id+'"  value="Resim Ekle ' + rect_count +'" >'
                    +'  </td>'
                    +'</tr>')
            }
        })
    }
}