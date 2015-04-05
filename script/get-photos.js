$(document).ready(function() 
{

    $( "#dialog" ).dialog({ autoOpen: false });
    $("body").on("click", ".swipebox", function(){
        // Clear the dialog box
        $( "#dialog" ).empty()
        
        // Some information about the image
        var link = $(this).attr('href');
        var id = $(this).attr('id');
        getImageInformation(id)
        console.log(link)
        console.log(id)

        // Construct the dialog box content
        $("#dialog").append('<p>Titre : <span id="detailTitre"></span></p>')
        $("#dialog").append('<p>Auteur : <span id="detailAuteur"></span></p>')
        $("#dialog").append('<p>Date : <span id="detailDate"></span></p><br><br>')
        $( "#dialog" ).append('<img src="'+link+'">')

        // Open the dialog box AFTER all operations
        $( "#dialog" ).dialog( "open" );
        /*alert($('.swipebox').attr('href'))*/
        return false;
    });

    // Initialization
    var page = 1
    var selectedNumber = parseInt($("input[type='radio']:checked").val())
    var mode =  $("input.mode[type='radio']:checked").val()

    $(".precedent").addClass("disabled")
    $(".suivant").addClass("disabled")
    $("#carouselMode").hide()
    $("#paginationMode").hide()   
    $(".endButtons").hide()

    // Research button click
    $("#submit-photos-pagination").on("click", function() {
        page = 1
        if( $("#commune").val() == ""){
            alert("Vous devez saisir au moins un mot clé")
            $("#commune").focus()
            return false
        }
        // Select the correct mode
        if (mode == "page") {
            getDataPaginationMode(page);
            $("#paginationMode").show()
            $("#carouselMode").hide()
        }

        else {
            getDataCarouselMode(page);
            $("#carouselMode").show() 
            $("#paginationMode").hide()
        }
    });

    // Previous button click
    $(".precedent").on("click", function(){
        if (page != 1)
            page--
        watchPreviousButton(page)
        getDataPaginationMode(page)
    });

    // Next button click
    $(".suivant").on("click", function(){
        page++;
        watchPreviousButton(page)
        getDataPaginationMode(page);
    });

    // When a change occurs, update the number of images to display
    $("input[type='radio']").on("change",function() {
        selectedNumber = parseInt($("input[type='radio']:checked").val());
    })

    $("input.mode[type='radio']").on("change",function() {
        mode = $("input.mode[type='radio']:checked").val()
    });

    // This function change class of previous button relative with page
    function watchPreviousButton(page){
        if (page == 1)
            $(".precedent").addClass("disabled")
        else
            $(".precedent").removeClass("disabled")

    }

    // Function to get images data from Flickr API in pagination mode
    function getDataPaginationMode(atPage)
    {
        $(".endButtons").show()
        // Set next button available
        $(".suivant").removeClass("disabled")
        // Clear the div of images when a new research is done
        $("#showImagesPaginationMode").empty();
        
        // Ajax JSON request
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
            data: "tags=" + $("#commune").val()+"&per_page="+selectedNumber+"&page="+atPage,
            success: function(data) {
                $.each(data.photos.photo, function(i, image) 
                {
                    // Show only the good number of images
                    if(i == selectedNumber)
                        return false;

                    // Call getImages function to delegate the responsability
                    getImagesPaginationMode(image);
                    
                })
            //FAILURE TODO 
            },
            error : function(){
                alert("error")
            }
        });
    }
    
    // Function to get data images for the carosuel mode
    function getDataCarouselMode(atPage)
    {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
            data: "tags=nantes&per_page="+selectedNumber+"&page="+atPage,
            success: function(data) {
                $.each(data.photos.photo, function(i, image) 
                {
                    // Show only the good number of images
                    if(i == selectedNumber)
                        return false;

                    // Call getImages function to delegate the responsability
                    getImagesCarouselMode(image);
                })
            },
            error : function(){
                alert("error")
            }
        });
        
    }

    // Function to show image
    function getImagesPaginationMode(image) {
        var link = "http://farm"+image.farm+".staticflickr.com/"+image.server+"/"+image.id+"_"+image.secret+"_z.jpg";
        var title = image.title
        $("#showImagesPaginationMode").append('<a href="'+link+'" class="swipebox" title="'+image.title+'" id="'+image.id+'"><img src="'+link+'" alt="'+image.title+'"></a>')
        
        $("#showImagesPaginationMode").justifiedGallery({
            lastRow : 'nojustify', 
            rowHeight : 300, 
            margins : 1
        }).on('jg.complete', function () {
          return true;
        });
    }

    // Function to show image
    function getImagesCarouselMode(image) {
        var link = "http://farm"+image.farm+".staticflickr.com/"+image.server+"/"+image.id+"_"+image.secret+"_z.jpg";
        $(".jcarousel-list").append('<li><img src="'+link+'" width="600" height="400" alt=""></li>')
        $('.jcarousel').jcarousel('reload');
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
                var date = data.photo.dates.posted;

                var formattedTime = timeConverter(date)

                alert("photo: "+data.photo+", title: "+data.photo.title._content+", username: "+data.photo.owner.username+", posted le: "+data.photo.dates.posted);
                //$("#detail").show();
                $("#detailTitre").text("[Photo sans titre...]");
                $("#detailTitre").text(data.photo.title._content);
                $("#detailAuteur").text(data.photo.owner.username);
                $("#detailDate").text(formattedTime);
            }
        });
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