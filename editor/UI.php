<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgEditor</title>     
    <script src="editor/lib/jquery-2.1.1.min.js"></script>
    <script src="editor/lib/bootstrap.min.js"></script>
    <link   rel="stylesheet" type="text/css" href="editor/lib/bootstrap.min.css">
    <script src="editor/lib/popper.min.js"></script>
    <script src="editor/lib/fabric.min.js"></script>
    <script src="editor/ageditor.js"></script>
    <script src="editor/ag.js"></script>
    <link   rel="stylesheet" type="text/css" href="editor/ag.css">
    <link   rel="stylesheet" type="text/css" href="editor/font-awesome/css/font-awesome.css">
    <!--  CROPPERJS -->
    <script src="editor/lib/cropper.js"></script>
    <link   rel="stylesheet" type="text/css" href="editor/lib/cropper.css">
    <!--  END       -->  

    
    <script src="editor/donusturucu.js"></script>

</head>

<script>
  <?php if(isset($_GET['agfileurl'])){ ?>
    var agfileurl = "<?php echo $_GET['agfileurl'];?>" 
  <?php } ?>
</script>



<body>

    <h1 style="background-color:#abcabc;">AgEditör</h1>

    <table style="width: 100%;">
      <tr>
        <td> sol deneme sütunu</td>
        <td>










          <div class="container ag-container col-12">
              <!-- =========================================  TOP MENU    =====================  -->
              <nav class="navbar navbar-default ">
                <div class="container-fluid">
                  <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                      <span class="sr-only">Toggle navigation</span>
                      <span class="icon-bar"></span>
                      <span class="icon-bar"></span>
                      <span class="icon-bar"></span>
                    </button>
                  </div>
                  <!-- Collect the nav links, forms, and other content for toggling -->
                  <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    <ul class="nav navbar-nav">
                      <li><a class="btn ag-fullpage">
                        <svg class="bi bi-arrows-fullscreen" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" d="M1.464 10.536a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3.5a.5.5 0 0 1-.5-.5v-3.5a.5.5 0 0 1 .5-.5z"/>
                          <path fill-rule="evenodd" d="M5.964 10a.5.5 0 0 1 0 .707l-4.146 4.147a.5.5 0 0 1-.707-.708L5.257 10a.5.5 0 0 1 .707 0zm8.854-8.854a.5.5 0 0 1 0 .708L10.672 6a.5.5 0 0 1-.708-.707l4.147-4.147a.5.5 0 0 1 .707 0z"/>
                          <path fill-rule="evenodd" d="M10.5 1.5A.5.5 0 0 1 11 1h3.5a.5.5 0 0 1 .5.5V5a.5.5 0 0 1-1 0V2h-3a.5.5 0 0 1-.5-.5zm4 9a.5.5 0 0 0-.5.5v3h-3a.5.5 0 0 0 0 1h3.5a.5.5 0 0 0 .5-.5V11a.5.5 0 0 0-.5-.5z"/>
                          <path fill-rule="evenodd" d="M10 9.964a.5.5 0 0 0 0 .708l4.146 4.146a.5.5 0 0 0 .708-.707l-4.147-4.147a.5.5 0 0 0-.707 0zM1.182 1.146a.5.5 0 0 0 0 .708L5.328 6a.5.5 0 0 0 .708-.707L1.889 1.146a.5.5 0 0 0-.707 0z"/>
                          <path fill-rule="evenodd" d="M5.5 1.5A.5.5 0 0 0 5 1H1.5a.5.5 0 0 0-.5.5V5a.5.5 0 0 0 1 0V2h3a.5.5 0 0 0 .5-.5z"/>
                        </svg>
                        </a></li>
                      <li><a class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="bottom" title="Bilgisayarımdan Aç"
                      id="openJsonFromLocal"><i class="fa fa-folder-open"></i></a></li>
                      <li><a class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="bottom" title="Bilgisayara Kaydet"
                      id="saveJsonToLocal"><i class="fa fa-floppy-o" aria-hidden="true"></i></a></li>
                      <li><a class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="bottom" title="Yeni Sayfa"
                      id="canvas-ekle"><i class="fa fa-file"></i></a></li>
                      <li><a class="nav-item nav-link" 
                      data-toggle="tooltip" data-placement="bottom" title="Zemin Resmi"
                      id="bg-ekle"><i class="fa fa-database"></i></a></li>
                      <li><a class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="bottom" title="Metin Kutusu"
                      id="textarea-ekle"><i class="fa fa-tumblr-square"></i></a></li>
                      <li><a class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="bottom" title="Resim Alanı"
                      id="croparea-ekle"><i class="fa fa-image"></i></a></li>
                      <li><a class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="bottom" title="Logo / Serbest Resim"
                      id="logo-ekle"><i class="fa fa-address-card" aria-hidden="true"></i></a></li>
                      <li><a class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="bottom" title="Sil"
                      id="obje-sil"><i class="fa fa-trash"></i></a></li>
                      <li><a class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="bottom" title="Belge Ayarları"
                      id="ag-settings"><i class="fa fa-cog" aria-hidden="true"></i></a></li>
                      
                      

                      <li><a class="nav-item nav-link"  
                        data-toggle="tooltip" data-placement="bottom" title="Bir Alta Gönder"
                        id="sendBackwards">
                        <svg class="bi bi-layers-half" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" d="M3.188 8L.264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l-4.578 2.441a.5.5 0 0 1-.47 0L3.188 8z"/>
                          <path fill-rule="evenodd" d="M7.765 1.559a.5.5 0 0 1 .47 0l7.5 4a.5.5 0 0 1 0 .882l-7.5 4a.5.5 0 0 1-.47 0l-7.5-4a.5.5 0 0 1 0-.882l7.5-4zM1.563 6L8 9.433 14.438 6 8 2.567 1.562 6z"/>
                        </svg>
                      </a></li>
                      
                      <li><a class="nav-item nav-link"  
                        data-toggle="tooltip" data-placement="bottom" title="Bir Öne Getir"
                        id="bringForward">
                        <svg style="transform: rotate(180deg);" class="bi bi-layers-half" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" d="M3.188 8L.264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l-4.578 2.441a.5.5 0 0 1-.47 0L3.188 8z"/>
                          <path fill-rule="evenodd" d="M7.765 1.559a.5.5 0 0 1 .47 0l7.5 4a.5.5 0 0 1 0 .882l-7.5 4a.5.5 0 0 1-.47 0l-7.5-4a.5.5 0 0 1 0-.882l7.5-4zM1.563 6L8 9.433 14.438 6 8 2.567 1.562 6z"/>
                        </svg>
                      </a></li>

                      <li><a class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="bottom" title="Sunum Moduna Geç"
                      id="sunumuBaslat"><i class="fa fa-eye"></i></a></li>
                      <li><a class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="bottom" title="Büyük Resim"
                      id="renderWithBigBGImage"><i class="fa fa-expand" aria-hidden="true"></i></a></li>
                      <li><a class="nav-item nav-link"  
                      data-toggle="tooltip" data-placement="bottom" title="Resmi İndir"
                      id="downloadBigImage"><i class="fa fa-download"></i></a></li>                    
                    </ul>  

                    <ul class="nav navbar-nav navbar-right">
                      <li><a class="nav-item nav-link" data-toggle="tooltip" data-placement="bottom" title="Sunucuya kaydet"
                        id="saveSablonToServer"><i class="fa fa-cloud-upload"></i></a>
                      </li>
                    </ul>
                  </div><!-- /.navbar-collapse -->
                </div><!-- /.container-fluid -->
              </nav>
              <!-- END -->

              <!-- =========================================  AGEDİTÖR MENU    =====================  -->
              <div id="ageditor" class="col-sm-7 col-md-9 col-lg-9 col-xl-9">
              </div>
              <!-- END-->

              <!-- =========================================  PROPERTIES PANEL    =====================  -->
              <div id="properties-panel" class="col-sm-4 col-md-3 col-lg-3 col-xl-3">
                <div class="card">
                  <h5 class="card-header">Özellikler </h5>
                  <div class="card-body">
                    <table class="table table-borderless properties">
                  
                    </table>
                  </div>
                </div>
              </div>
              <!-- END-->

              <!-- =========================================  INPUT PANEL    =====================  -->
              <div id="preview-input-panel" class="col-sm-4 col-md-3 col-lg-3 col-xl-3" style="display: none;">
                <div class="card">
                  <h5 class="card-header">Giriş</h5>
                  <div class="card-body">
                    <fieldset class="ag-alanseti">
                      <legend>Tasarım Yazı &amp; Resim Alanları</legend>
                      <table class="table table-borderless inputs textbox">  
                      </table>
                      <table class="table table-borderless inputs cropbox">  
                      </table>
                    </fieldset>
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
                      <button type="button" class="btn btn-link ag-crop-resim-resimlerim" style="display: none;">
                      <i class="fa fa-picture-o" aria-hidden="true"></i> <br> Resimlerim </button>
                      <button type="button" class="btn btn-link ag-crop-resim-yukle">
                      <i class="fa fa-cloud-upload" aria-hidden="true"></i> <br> Yükle </button>
                      <button type="button" class="btn btn-link ag-crop-resim-rotate-left crop-menu-item">
                      <i class="fa fa-undo" aria-hidden="true"></i> <br>Dödür</button>
                      <button type="button" class="btn btn-link ag-crop-resim-rotate-right crop-menu-item">
                      <i class="fa fa-repeat" aria-hidden="true"></i> <br> Dödür </button>
                      <button type="button" class="btn btn-link ag-crop-resim-crop crop-menu-item">
                      <i class="fa fa-crop" aria-hidden="true"></i> <br> Kırp </button>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body"> 
                        
                    </div>
                    <div class="modal-footer"> 
                      <button type="button" class="btn btn-secondary ag-crop-resim-crop" data-dismiss="modal">Kırp ve Kapat</button>
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">Vazgeç</button>
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

              <!-- =========================================  MODAL FONT SETTİNG   =====================  -->
              <div class="modal ag-modal" tabindex="-1" id="modal-font-setting" role="dialog">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      Font & Renk Seçin
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body"> 
                       <div class="col-12 ag-font-list">
                        
                       </div>
                       <div class="col-12 ag-color-list">
                       coror
                       </div>
                    </div>
                    <div class="modal-footer"> 
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">Kapat</button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- END-->


              <!-- =========================================  MODAL TEXT İNPUT   =====================  -->
              <div class="modal ag-modal" tabindex="-1" id="modal-text-input" role="dialog">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header"> 
                        YAZI ALANI
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body"> 
                       <input type="text" class="form-control ag-textbox"                   id="ag-input-text"      data-target-id='' value="" placeholder="Yazı yazın">
                       <textarea          class="ag-form-control form-control ag-textarea"  id="ag-input-textarea"  data-target-id="" ></textarea>
                    </div>
                    <div class="modal-footer"> 
                      <button type="button" class="btn btn-success ag-modal-tamam-btn" data-dismiss="modal">Tamam</button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- END-->


              <!-- =========================================  MODAL SETTİNGS   =====================  -->
              <div class="modal ag-modal" tabindex="-1" id="modal-settings" role="dialog">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header"> 
                        BELGE AYARLARI
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="control-label">Belge Türü</label>
                            <select class="form-control ag-belge-turu">
                              <option value="varsayilan_belge">Varsayılan Belge</option>
                              <option value="tek_harfli_banner">Tek Harfli Banner</option>
                            </select>
                         </div>
                    </div>
                    <div class="modal-footer"> 
                      <button type="button" class="btn btn-success ag-modal-settings-tamam-btn" data-dismiss="modal">Kaydet</button>
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