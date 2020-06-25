<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>agEditor</title> 

    <script src="editor/node_modules/jquery/dist/jquery.min.js"></script>
    <script src="editor/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    <link   rel="stylesheet" type="text/css" href="editor/node_modules/bootstrap/dist/css/bootstrap.min.css">
    <script src="editor/lib/popper.min.js"></script>
    <script src="editor/lib/fabric.min.js"></script>
    <script src="editor/ageditor.js"></script>
    <link   rel="stylesheet" type="text/css" href="editor/ag.css">
    <script src="editor/ag.js"></script>
    <script src="editor/node_modules/@fortawesome/fontawesome-free/js/all.js"></script>
    <link   rel="stylesheet" type="text/css" href="editor/node_modules/@fortawesome/fontawesome-free/css/all.css">

    <!--  CROPPERJS -->
    <script src="editor/lib/cropper.js"></script>
    <link   rel="stylesheet" type="text/css" href="editor/lib/cropper.css">
    <!--  END       -->
    
</head>
<body>

    <h1 style="background-color:#abcabc;">AgEditör</h1>

    <table style="width: 100%;">
      <tr>
        <td> sol deneme sütunu</td>
        <td>










          <div class="container ag-container col-12">
              <!-- =========================================  TOP MENU    =====================  -->
              <nav class="navbar navbar-expand-lg navbar-light bg-light ">
                  <div class="btn ag-fullpage">
                    <svg class="bi bi-arrows-fullscreen" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" d="M1.464 10.536a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3.5a.5.5 0 0 1-.5-.5v-3.5a.5.5 0 0 1 .5-.5z"/>
                      <path fill-rule="evenodd" d="M5.964 10a.5.5 0 0 1 0 .707l-4.146 4.147a.5.5 0 0 1-.707-.708L5.257 10a.5.5 0 0 1 .707 0zm8.854-8.854a.5.5 0 0 1 0 .708L10.672 6a.5.5 0 0 1-.708-.707l4.147-4.147a.5.5 0 0 1 .707 0z"/>
                      <path fill-rule="evenodd" d="M10.5 1.5A.5.5 0 0 1 11 1h3.5a.5.5 0 0 1 .5.5V5a.5.5 0 0 1-1 0V2h-3a.5.5 0 0 1-.5-.5zm4 9a.5.5 0 0 0-.5.5v3h-3a.5.5 0 0 0 0 1h3.5a.5.5 0 0 0 .5-.5V11a.5.5 0 0 0-.5-.5z"/>
                      <path fill-rule="evenodd" d="M10 9.964a.5.5 0 0 0 0 .708l4.146 4.146a.5.5 0 0 0 .708-.707l-4.147-4.147a.5.5 0 0 0-.707 0zM1.182 1.146a.5.5 0 0 0 0 .708L5.328 6a.5.5 0 0 0 .708-.707L1.889 1.146a.5.5 0 0 0-.707 0z"/>
                      <path fill-rule="evenodd" d="M5.5 1.5A.5.5 0 0 0 5 1H1.5a.5.5 0 0 0-.5.5V5a.5.5 0 0 0 1 0V2h3a.5.5 0 0 0 .5-.5z"/>
                    </svg>
                  </div>
                  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                  </button>
                  <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div class="navbar-nav">
                      <div class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="top" title="Bilgisayarımdan Aç"
                      id="openJsonFromLocal"href="#"><i class="fas fa-folder-open"></i></div>
                      <div class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="top" title="Yeni Sayfa"
                      id="canvas-ekle" href="#"><i class="fas fa-file"></i></div>
                      <div class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="top" title="Bilgisayara Kaydet"
                      id="saveJsonToLocal"href="#"><i class="fas fa-file-download"></i></div>
                      <div class="nav-item nav-link" 
                      data-toggle="tooltip" data-placement="top" title="Zemin Resmi"
                      id="bg-ekle" href="#"><i class="fas fa-stroopwafel"></i></div>
                      <div class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="top" title="Metin Kutusu"
                      id="textarea-ekle" href="#"><i class="fab fa-tumblr-square"></i></div>
                      <div class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="top" title="Resim Alanı"
                      id="croparea-ekle" href="#"><i class="fas fa-image"></i></div>
                      <div class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="top" title="Logo / Serbest Resim"
                      id="logo-ekle" href="#"><i class="fas fa-icons"></i></div>
                      <div class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="top" title="Sil"
                      id="obje-sil"href="#"><i class="fas fa-trash"></i></div>
                      

                      <div class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="top" title="Bir Alta Gönder"
                      id="sendBackwards"href="#">
                        <svg class="bi bi-layers-half" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" d="M3.188 8L.264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l-4.578 2.441a.5.5 0 0 1-.47 0L3.188 8z"/>
                          <path fill-rule="evenodd" d="M7.765 1.559a.5.5 0 0 1 .47 0l7.5 4a.5.5 0 0 1 0 .882l-7.5 4a.5.5 0 0 1-.47 0l-7.5-4a.5.5 0 0 1 0-.882l7.5-4zM1.563 6L8 9.433 14.438 6 8 2.567 1.562 6z"/>
                        </svg>
                      </div>
                      
                      <div class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="top" title="Bir Öne Getir"
                      id="bringForward"href="#">
                        <svg style="transform: rotate(180deg);" class="bi bi-layers-half" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" d="M3.188 8L.264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l-4.578 2.441a.5.5 0 0 1-.47 0L3.188 8z"/>
                          <path fill-rule="evenodd" d="M7.765 1.559a.5.5 0 0 1 .47 0l7.5 4a.5.5 0 0 1 0 .882l-7.5 4a.5.5 0 0 1-.47 0l-7.5-4a.5.5 0 0 1 0-.882l7.5-4zM1.563 6L8 9.433 14.438 6 8 2.567 1.562 6z"/>
                        </svg>
                      </div>

                      <div class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="top" title="Sunum Moduna Geç"
                      id="sunumuBaslat"href="#"><i class="fas fa-eye"></i></div>
                      <div class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="top" title="Büyük Resmi Çiz"
                      id="renderWithBigBGImage"href="#"><i class="fas fa-expand-alt"></i></div>
                      <div class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="top" title="Büyük Resmi İndir"
                      id="downloadBigImage"href="#"><i class="fas fa-file-download"></i></div>

                    </div>
                  </div>
              </nav>
              <!-- END -->


              <!-- =========================================  AGEDİTÖR MENU    =====================  -->
              <div id="ageditor" class="col-sm-7 col-md-9 col-lg-9 col-xl-9">
              </div>
              <!-- END-->

              <!-- =========================================  PROPERTIES PANEL    =====================  -->
              <div id="properties-panel" class="col-sm-4 col-md-3 col-lg-3 col-xl-3">
                <div class="card">
                  <h5 class="card-header">Özellikler</h5>
                  <div class="card-body">
                    <table class="table table-borderless properties">
                  
                    </table>
                  </div>
                </div>
              </div>
              <!-- END-->

              <!-- =========================================  PREVIEW PANEL    =====================  -->
              <div id="preview-input-panel" class="col-sm-4 col-md-3 col-lg-3 col-xl-3" style="display: none;">
                <div class="card">
                  <h5 class="card-header">Giriş</h5>
                  <div class="card-body">
                    <table class="table table-borderless inputs">
                    </table>
                  </div>
                </div>
              </div>
              <!-- END -->




              <!-- =========================================  MODAL KÜTÜPHANE SEÇ    =====================  -->
              <div class="modal ag-modal" tabindex="-1" id="modal-kutuphane" role="dialog">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Resimler</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body"> 
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">Kapat</button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- END-->

              <!-- =========================================  MODAL RESİMLERİM   =====================  -->
              <div class="modal modal-fullscreen ag-modal"  tabindex="-1" id="modal-agcropper" role="dialog">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <button type="button" class="btn btn-link ag-crop-resim-resimlerim" style="display: none;"><i class="fas fa-caret-square-left"></i> Resimlerim </button>
                      <button type="button" class="btn btn-link ag-crop-resim-yukle"><i class="fas fa-upload"></i> Yükle </button>
                      <button type="button" class="btn btn-link ag-crop-resim-rotate-left crop-menu-item"><i class="fas fa-undo"></i></i></button>
                      <button type="button" class="btn btn-link ag-crop-resim-rotate-right crop-menu-item"><i class="fas fa-redo"></i></button>
                      <button type="button" class="btn btn-link ag-crop-resim-crop crop-menu-item"><i class="fas fa-crop"></i> Kırp </button>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body"> 
                        
                    </div>
                    <div class="modal-footer"> 
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">Kapat</button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- END-->

              <!-- =========================================  MODAL PROGRESS   =====================  -->
              <div class="modal ag-modal" tabindex="-1" id="modal-progress" role="dialog">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header" style="background-color: darkgrey;">
                      DURUM
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body"> 
                      <div style="width: 100%;text-align: center;padding: 25px;">
                          <div class="spinner-border text-muted"></div>
                          <br>
                          İşlem devam ediyor.
                      </div>
                    </div>
                    <div class="modal-footer"> 
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">Kapat</button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- END-->

          </div><!-- End container -->







        </td>
        <td>sağ deneme sütunu</td>
      </tr>
    </table>
    
</body>
</html>