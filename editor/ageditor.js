class AgEditor {

    constructor(){
        this.scale               = 1;
        this.agdocument          = null;
        this.target_html_element = $('#ageditor');
        this.fabricCanvases      = [];
    }

    async createPages(agdocument){
        this.fabricCanvases      = []
        let BU                   = this;
        this.agdocument          = agdocument;
        await BU._createPage(0); 
    }

    empty() { 
        $(this.target_html_element).empty();
    }

    async _createPage(index){
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
                await BU._createPage(index);
                let canvas  = new fabric.Canvas(page.id,{backgroundColor:page.bgColor});
                BU.fabricCanvases[page.id] = canvas;
                await BU.createPageObjects(page)
                resolve()
            })
        }
    }

    async createPageObjects(page){
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
                                        fill: 'yellow',
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
}
 