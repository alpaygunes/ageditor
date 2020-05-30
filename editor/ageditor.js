class AgEditor {

    constructor(){
        this.scale               = 1;
        this.agdocument          = null;
        this.target_html_element = $('#ageditor');
        this.fabricCanvases      = [];
        this.activeCanvas        = null;
        this.textBoxJson         = null;
        this.logoBoxJson         = null;
        this.cropBoxJson         = null;
        this._loadTextBoxJson();
        this._loadCropBoxJson();
        this._loadLogoBoxJson();
    }

    async createPages(agdocument){
        this.fabricCanvases      = []
        let BU                   = this;
        this.agdocument          = agdocument;
        await BU._createCanvas(0); 
    }

    async empty() { 
        $(this.target_html_element).empty();
    }

    async setPageBgImage(imgElm){
        if(this.activeCanvas){
            let BU = this;
            let wrapper_id = $(this.activeCanvas.getElement()).attr('id');
            $.each(this.agdocument.pages,function(i,page){
                if(page.id == wrapper_id){
                    page.bgImage = $(imgElm).attr('src');
                    return;
                }
            })
            BU.activeCanvas.setHeight($(imgElm).get(0).naturalHeight);
            BU.activeCanvas.setWidth($(imgElm).get(0).naturalWidth);
            fabric.Image.fromURL($(imgElm).attr('src'), function(oImg) {
                oImg.lockMovementX = oImg.lockMovementY = true;
                oImg.hasControls = false
                oImg.evented = false
                BU.activeCanvas.add(oImg);
                BU.activeCanvas.moveTo(oImg, 0)
            }); 
        }else{
            alert("Sayfa seçin")
        }
    }

    async addTextArea(){
        if(this.activeCanvas){
            let BU = this;
            let wrapper_id = $(this.activeCanvas.getElement()).attr('id');
            $.each(this.agdocument.pages, async function(i,page){
                if(page.id == wrapper_id){
                    BU.textBoxJson      = fabric.util.object.clone(BU.textBoxJson)
                    BU.textBoxJson.id   = Math.floor(Math.random() * 100000) + 1
                    page.objects.push(BU.textBoxJson)
                    let textBoxFabricInstance = await BU.getTextBoxFabricInstance();
                    textBoxFabricInstance.top = (Math.floor(Math.random() * 300) + 1)
                    BU.activeCanvas.add(textBoxFabricInstance);
                }
            }) 
        }else{
            alert("Sayfa seçin")
        }
    }

    async addCropArea(){
        if(this.activeCanvas){
            let BU = this;
            let wrapper_id = $(this.activeCanvas.getElement()).attr('id');
            $.each(this.agdocument.pages,async function(i,page){
                if(page.id == wrapper_id){
                    BU.cropBoxJson = fabric.util.object.clone(BU.cropBoxJson)
                    BU.cropBoxJson.id = Math.floor(Math.random() * 100000) + 1
                    page.objects.push(BU.cropBoxJson)
                    let cropBoxFabricInstance   = await BU.getCropBoxFabricInstance();
                    cropBoxFabricInstance.top   = (Math.floor(Math.random() * 300) + 1)
                    BU.activeCanvas.add(cropBoxFabricInstance);
                }
            }) 
        }else{
            alert("Sayfa seçin")
        }
    }

    async addLogo(imgElm){
        if(this.activeCanvas){
            let BU = this;
            let wrapper_id = $(this.activeCanvas.getElement()).attr('id');
            $.each(this.agdocument.pages,async function(i,page){
                if(page.id == wrapper_id){
                    BU.logoBoxJson      = fabric.util.object.clone(BU.logoBoxJson)
                    BU.logoBoxJson.id   = Math.floor(Math.random() * 100000) + 1
                    page.objects.push(BU.logoBoxJson)
                    await BU.getLogoBoxFabricInstance(imgElm);
                }
            })
 
        }else{
            alert("Sayfa seçin")
        } 
    }

    async addCanvas(){
        let id = Math.floor(Math.random() * 100000) + 1;
        let w  = 600;
        let h  = 700;
        let bgColor = "#ffffff"

        $(this.target_html_element).append('<canvas id="'
                                            +id+'" width="'
                                            +w*this.scale+'"  height="'
                                            +h*this.scale+'"></canvas>');
        $(this.target_html_element).append('<div class="clear"></div'); 
        let canvas  = new fabric.Canvas(id.toString(),{backgroundColor:bgColor});
        canvas.on("mouse:down", (opt)=>{
                                    if(this.activeCanvas){
                                        $(this.activeCanvas.wrapperEl).css('outline','none');
                                    }
                                    this.activeCanvas = canvas;
                                    console.log("CANVAS______\n", canvas)
                                    console.log("active object______\n", this.activeCanvas.getActiveObject())
                                    $('#'+id).parent().css('outline','thick solid aqua');
                                });
        this.fabricCanvases[id] = canvas;
    }

    async _createCanvas(index){
        let BU = this
        if(this.agdocument.pages.hasOwnProperty(index)){
            let page = this.agdocument.pages[index];
            return new Promise(async function(resolve,reject) {  
                $(BU.target_html_element).append('<canvas id="'
                                                    +page.id+'" width="'
                                                    +page.w*BU.scale+'"  height="'
                                                    +page.h*BU.scale+'"></canvas>');
                $(BU.target_html_element).append('<div class="clear"></div');
                index++;
                await BU._createCanvas(index);
                let canvas  = new fabric.Canvas(page.id,{backgroundColor:page.bgColor});
                canvas.on("mouse:down", function(opt){
                                            if(BU.activeCanvas){
                                                $(BU.activeCanvas.wrapperEl).css('outline','none');
                                            }
                                            BU.activeCanvas = canvas;
                                            console.log("CANVAS______\n", canvas)
                                            console.log("active object______\n", BU.activeCanvas.getActiveObject())
                                            $('#'+page.id).parent().css('outline','thick solid aqua');
                                        });
                BU.fabricCanvases[page.id] = canvas;                
                await BU.createObjects(page)
                resolve()
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
                let fbrkObj;
                if(obje.type == 'Textbox'){ 
                    fbrkObj = new fabric.Textbox(obje.defaultText, 
                                    {
                                        id:   obje.id,
                                        fontFamily: obje.fontFamily,
                                        left:       obje.left*BU.scale,
                                        top:        obje.top*BU.scale, 
                                        width:      obje.width*BU.scale,
                                        height:     obje.height*BU.scale,
                                        fixedWidth: obje.fixedWidth,   
                                        fixedFontSize: obje.fixedFontSize,
                                        fontSize:   obje.fontSize*BU.scale,
                                        fill:       obje.fill,
                                        textAlign:  obje.textAlign,
                                        stroke:     obje.stroke,
                                        centeredRotation: true,
                                        angle:      obje.angle
                                    });
                }else if(obje.type == 'CropBox'){
                    fbrkObj = new fabric.Rect({
                                        id:   obje.id,
                                        left: obje.left*BU.scale,
                                        top:  obje.top*BU.scale, 
                                        fill: obje.fill,
                                        width:obje.width*BU.scale,
                                        height:obje.height*BU.scale,
                                        objectCaching: false,
                                        stroke: 'lightgreen',
                                        strokeWidth: 1,
                                    });
                }

                if(fbrkObj){
                    BU.fabricCanvases[page.id].add(fbrkObj) 
                    BU.fabricCanvases[page.id].centerObjectH(fbrkObj)  
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
                    cropAlign:  this.cropBoxJson.cropAlign,
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
}