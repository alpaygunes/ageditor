class AgEditor {

    constructor(){
        this.scale               = 1;
        this.agdocument          = null;
        this.target_html_element = $('#ageditor');
        this.fabricCanvases      = [];
        this.activeCanvas        = null;
        this.textBoxJson         = null;
        this.textBoxFabricInstance = null;
        this._loadTextBoxJson();
    }

    async createPages(agdocument){
        this.fabricCanvases      = []
        let BU                   = this;
        this.agdocument          = agdocument;
        await BU._createCanvas(0); 
    }

    empty() { 
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
                oImg.evented =false
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
            $.each(this.agdocument.pages,function(i,page){
                if(page.id == wrapper_id){
                    BU.textBoxJson = fabric.util.object.clone(BU.textBoxJson)
                    BU.textBoxJson.id = Math.floor(Math.random() * 100000) + 1
                    page.objects.push(BU.textBoxJson)

                    let textBoxFabricInstance = fabric.util.object.clone(BU.textBoxFabricInstance);
                    textBoxFabricInstance.top= (Math.floor(Math.random() * 300) + 1)
                    BU.activeCanvas.add(textBoxFabricInstance);
                }
            }) 
        }else{
            alert("Sayfa seçin")
        }
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
                                            console.log("Page ID", canvas)
                                            console.log("active object", BU.activeCanvas.getActiveObject())
                                            $('#'+page.id).parent().css('outline','thick solid aqua');
                                        });
                BU.fabricCanvases[page.id] = canvas;                
                await BU.createCanvasObjects(page)
                resolve()
            })
        }
    }

    async createCanvasObjects(page){
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
                }else if(obje.type == 'CropArea'){
                    fbrkObj = new fabric.Rect({
                                        left: obje.left*BU.scale,
                                        top:  obje.top*BU.scale, 
                                        fill: 'rgba(200,200,200,0.5)',
                                        width:obje.width*BU.scale,
                                        height:obje.height*BU.scale,
                                        objectCaching: false,
                                        stroke: 'lightgreen',
                                        strokeWidth: 1,
                                    });
                }

                BU.fabricCanvases[page.id].add(fbrkObj) 
                BU.fabricCanvases[page.id].centerObjectH(fbrkObj)  
                  
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
            this.textBoxFabricInstance = new fabric.Textbox(textbox.defaultText, 
                {
                    fontFamily: textbox.fontFamily,
                    left:       textbox.left*BU.scale,
                    top:        textbox.top*BU.scale, 
                    width:      textbox.width*BU.scale,
                    height:     textbox.height*BU.scale,
                    fixedWidth: textbox.fixedWidth,   
                    fixedFontSize: textbox.fixedFontSize,
                    fontSize:   textbox.fontSize*BU.scale,
                    fill:       textbox.fill,
                    textAlign:  textbox.textAlign,
                    stroke:     textbox.stroke,
                    centeredRotation: true,
                    angle:      textbox.angle
                });
        });
    }
}