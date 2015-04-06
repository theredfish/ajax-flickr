$(document).ready(function() 
{

    /* ==============================================================
                            INITIALISATION
       ==============================================================*/
    var page = 1
    var selectedNumber = parseInt($("input[type='radio']:checked").val())
    var mode =  $("input.mode[type='radio']:checked").val()
    var auteur = "nobody"
    //var userId = "noId"
    //window.userID = "noID"

    $(".precedent").addClass("disabled")
    $(".suivant").addClass("disabled")
    $("#carouselMode").hide()
    $("#paginationMode").hide()   
    $(".endButtons").hide()


    // Date picker
    $("#datePhoto").datepicker();

    // Modal 
    $( "#dialog" ).dialog(
    { 
        autoOpen: false,
        title: "Informations de l'image",
        width: 660
    });

    /* ==============================================================
                        EVENTS / ANONYMOUS FUNCTIONS
       ==============================================================*/
    $("body").on("click", ".swipebox", function()
    {
        // Clear the dialog box content
        $("#dialog").empty()
        
        // If the dialog box is already open we close it
        var isOpen = $("#dialog").dialog("isOpen")
        if (isOpen) 
        {
            $("#dialog").dialog(
            {
                position: { my: "center", at: "center", of: window }
            });
        }

        // Some information about the image
        var link = $(this).attr('href')
        var id = $(this).attr('id')
        getImageInformation(id)

        // Construct the dialog box content
        $("#dialog").append('<p><b>Titre :</b> <span id="detailTitre"></span></p>')
        $("#dialog").append('<p><b>Auteur :</b> <span id="detailAuteur"></span></p>')
        $("#dialog").append('<p><b>Date :</b> <span id="detailDate"></span></p><br><br>')
        $( "#dialog" ).append('<img src="'+link+'">')

        // Open the dialog box AFTER all operations
        $( "#dialog" ).dialog( "open" )
        return false;
    });

    // Research button click
    $("#submit-photos-pagination").on("click", function()
    {
        loadContent();
    });

    // Research by keypress enter event in city input field
    $("#commune").keypress(function (e) 
    {
        if (e.which == 13) 
        {
            $('#submit-photos-pagination').trigger('click');
        }
    });

    // Research by keypress enter event in author input field
    $("#infoAuteur").keypress(function (e) 
    {
        if (e.which == 13) 
        {
            $('#submit-photos-pagination').trigger('click');
        }
    });     

    // Previous button click
    $(".precedent").on("click", function()
    {
        // Always close the dialog box if it's open
        var isOpen = $("#dialog").dialog("isOpen")
        if (isOpen)
            $("#dialog").dialog("close")

        if (page != 1)
            page--
        watchPreviousButton(page)
        if (mode == "page") 
        {
            getDataPaginationPageMode(page)
        }
        else
        {
            getDataPaginationMode(page)
        }
        
    });

    // Next button click
    $(".suivant").on("click", function()
    {
        // Always close the dialog box if it's open
        var isOpen = $("#dialog").dialog("isOpen")
        if (isOpen)
            $("#dialog").dialog("close")

        page++;
        watchPreviousButton(page)
        if (mode == "page") 
        {
            getDataPaginationPageMode(page)
        }
        else
        {
            getDataPaginationMode(page)
        }
    });

    // When a change occurs, update the number of images to display
    $("input[type='radio']").on("change",function() 
    {
        selectedNumber = parseInt($("input[type='radio']:checked").val());
    })

    $("input.mode[type='radio']").on("change",function() 
    {
        mode = $("input.mode[type='radio']:checked").val()
    });

    /* ==============================================================
                            FUNCTIONS
       ==============================================================*/
    // Function to show gallery or carousel content
    function loadContent()
    {
        page = 1
        if( $("#commune").val() == "" && $("#infoAuteur").val() == "")
        {
            alert("Vous devez saisir au moins un mot clé")
            $("#commune").focus()
            return false
        }
        // Select the correct mode
        if(mode == "page")
        {
            getDataPaginationPageMode(page);
            $("#paginationMode").show()
            $("#carouselMode").hide()
        }
        else if (mode == "regroupement") 
        {
            getDataPaginationMode(page);
            $("#paginationMode").show()
            $("#carouselMode").hide()
        }
        else 
        {
            getDataCarouselMode(page);
            $("#carouselMode").show() 
            $("#paginationMode").hide()
        }
    }

    // This function change class of previous button relative with page
    function watchPreviousButton(page)
    {
        if (page == 1)
            $(".precedent").addClass("disabled")
        else
            $(".precedent").removeClass("disabled")

    }

    // Function to get images data from Flickr API in pagination mode
    function getDataPaginationMode(atPage)
    {
        var username = $("#infoAuteur").val()
        
        var userid = (function () {
            var ajaxResponse;
            $.ajax(
            {
                type: "POST",
                url: "https://api.flickr.com/services/rest/?method=flickr.people.findByUsername&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
                data: "username="+username,
                success: function (data) {
                    userID = data.user.id;
                    var dataSearch = "tags=" + $("#commune").val()+"&per_page="+selectedNumber+"&page="+atPage
        
                    if ($("#datePhoto").val() != "A partir de") {
                        date = ($("#datePhoto").val());
                        date = Date.parse(date)/1000;
                        dataSearch += "&min_upload_date="+date+"&sort=date-posted-asc"
                    } else
                        date = "0";

                    if ($("#infoAuteur").val() != ''){
                        dataSearch += "&user_id="+userID
                    }

                    $(".endButtons").show()
                    // Set next button available
                    $(".suivant").removeClass("disabled")
                    // Clear the div of images when a new research is done
                    $("#showImagesPaginationMode").empty();
                    
                    // Ajax JSON request
                    $.ajax(
                    {
                        type: "POST",
                        dataType: "json",
                        url: "https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
                        data: dataSearch,
                        success: function(data) 
                        {
                            if (data.photos.photo.length == 0)
                                alert("Aucune données pour cette recherche")
                            $.each(data.photos.photo, function(i, image) 
                            {
                                // Show only the good number of images
                                if(i == selectedNumber)
                                    return false;

                                // Call getImages function to delegate the responsability
                                getImagesPaginationMode(image);
                                
                            })
                        },
                        error : function()
                        {
                            alert("Une erreur dans la récupération des données est survenue.")
                        }
                    });
                }, dataType: "json"});
        }()); 
    }

     // Function to get images data from Flickr API in pagination mode
    function getDataPaginationPageMode(atPage)
    {   
        var username = $("#infoAuteur").val()
        
        var userid = (function () {
            var ajaxResponse;
            $.ajax(
            {
                type: "POST",
                url: "https://api.flickr.com/services/rest/?method=flickr.people.findByUsername&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
                data: "username="+username,
                success: function (data) {
                    userID = data.user.id;
                    var dataSearch = "tags=" + $("#commune").val()+"&per_page="+selectedNumber+"&page="+atPage

                    if ($("#datePhoto").val() != "A partir de") {
                        date = ($("#datePhoto").val());
                        date = Date.parse(date)/1000;
                        dataSearch += "&min_upload_date="+date+"&sort=date-posted-asc"
                    } else
                        date = "0";

                    if ($("#infoAuteur").val() != ''){
                        dataSearch += "&user_id="+userID
                    }

                    $(".endButtons").show()
                    // Set next button available
                    $(".suivant").removeClass("disabled")
                    // Clear the div of images when a new research is done
                    $("#showImagesPaginationMode").empty()
                    $("#showImagesPaginationMode").removeClass("justified-gallery")
                    
                    // Ajax JSON request
                    $.ajax(
                    {
                        type: "POST",
                        dataType: "json",
                        url: "https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
                        data: dataSearch,
                        success: function(data) 
                        {
                            if (data.photos.photo.length == 0)
                                alert("Aucune données pour cette recherche")
                            $.each(data.photos.photo, function(i, image) 
                            {
                                // Show only the good number of images
                                if(i == selectedNumber){
                                    return false;
                                }

                                // Call getImages function to delegate the responsability
                                getImagesPaginationPageMode(image);
                                
                            })
                        },
                        error : function()
                        {
                            alert("Une erreur dans la récupération des données est survenue.")
                        }
                    });
                }, dataType: "json"});
        }());      
    }
    
    // Function to get data images for the carosuel mode
    function getDataCarouselMode(atPage)
    {
        var username = $("#infoAuteur").val()
        
        var userid = (function () {
            var ajaxResponse;
            $.ajax(
            {
                type: "POST",
                url: "https://api.flickr.com/services/rest/?method=flickr.people.findByUsername&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
                data: "username="+username,
                success: function (data) {
                    userID = data.user.id;
                    var dataSearch = "tags=" + $("#commune").val()+"&per_page="+selectedNumber+"&page="+atPage

                    if ($("#datePhoto").val() != "A partir de") {
                        date = ($("#datePhoto").val());
                        date = Date.parse(date)/1000;
                        dataSearch += "&min_upload_date="+date+"&sort=date-posted-asc"
                    } else
                        date = "0";

                    if ($("#infoAuteur").val() != '')
                        dataSearch += "&user_id="+userID

                    $.ajax(
                    {
                        type: "POST",
                        dataType: "json",
                        url: "https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
                        data: dataSearch,
                        success: function(data) 
                        {
                            if (data.photos.photo.length == 0)
                                alert("Aucune données pour cette recherche")
                            $.each(data.photos.photo, function(i, image) 
                            {
                                // Show only the good number of images
                                if(i == selectedNumber)
                                    return false;

                                // Call getImages function to delegate the responsability
                                getImagesCarouselMode(image);
                            })
                        },
                        error : function()
                        {
                            alert("Une erreur dans la récupération des données est survenue.")
                        }
                    });
                }, dataType: "json"});
        }());

        
    }

    // Function to get specific information about an image (ex : title, author, date, ...)
    function getImageInformation(id)
    { 
        $.ajax(
        {
            type: "POST",
            dataType: "json",
            url: "https://api.flickr.com/services/rest/?&method=flickr.photos.getInfo&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
            data: "photo_id="+id,
            success: function(data) 
            {
                var formattedTime = timeConverter(data.photo.dates.posted)
                if (data.photo.title._content == "")
                {
                    $("#detailTitre").text("[Photo sans titre...]");
                }
                else
                {
                    $("#detailTitre").text(data.photo.title._content);
                }
                $("#detailAuteur").text(data.photo.owner.username);
                $("#detailDate").text(formattedTime);
            }
        });
    }

    // Function to show image
    function getImagesPaginationMode(image) 
    {
        var link = "http://farm"+image.farm+".staticflickr.com/"+image.server+"/"+image.id+"_"+image.secret+"_z.jpg";
        var titre = image.title
        if (titre == "")
        {
            titre = "[Photo sans titre....]";
        }

        $("#showImagesPaginationMode").append('<a href="'+link+'" class="swipebox" title="'+image.title+'" id="'+image.id+'"><img src="'+link+'" alt="'+titre+'"></a>')
        
        $("#showImagesPaginationMode").justifiedGallery(
        {
            lastRow : 'nojustify', 
            rowHeight : 300, 
            margins : 1
        }).on('jg.complete', function () 
        {
          return true;
        });
    }

     function getImagesPaginationPageMode(image) 
     {
        var link = "http://farm"+image.farm+".staticflickr.com/"+image.server+"/"+image.id+"_"+image.secret+"_z.jpg";
        var titre = image.title
        if (titre == "")
        {
            titre = "[Photo sans titre....]";
        }
        $("#showImagesPaginationMode").append('<div class="col-lg-6 col-md-6 col-xs-6 col-lg-offset-3 col-md-offset-3 col-xs-offset-3"><center><a href="'+link+'" class="swipebox" title="'+image.title+'" id="'+image.id+'"><img id="imagePage" src="'+link+'" alt="'+titre+'"></a></center></div>')
        
    }

    // Function to show image
    function getImagesCarouselMode(image) 
    {
        var link = "http://farm"+image.farm+".staticflickr.com/"+image.server+"/"+image.id+"_"+image.secret+"_z.jpg";

        $(".jcarousel-list").append('<li><a class="swipebox" href="'+link+'" title="'+image.title+'" id="'+image.id+'"><img src="'+link+'" width="600" height="400" alt=""></a></li>')
        $('.jcarousel').jcarousel('reload');
    }
    
    // Function to convert a date (unix time stamp) in a readable format by humans
    // This function will no longer work on 19 January 2038 :=)
    function timeConverter(UNIX_timestamp)
    {
        var a = new Date(UNIX_timestamp*1000);
        var months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' - ' + hour + ':' + min + ':' + sec ;

        return time;
    }
});