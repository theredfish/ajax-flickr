$(document).ready(function() {
    var page = 0;
    // Get the number of images to show
    var selectedNumber = parseInt($("input[type='radio']:checked").val());   

    $( "#submit-photos-pagination" ).on("click", function() {
        page = 1
        getDataPaginationMode(page);
    });

    $("#precedent").on("click", function(){
        if (page != 1)
            page--;
        getDataPaginationMode(page);
    });

    $("#suivant").on("click", function(){
        page++;
        getDataPaginationMode(page);
    });

    // When a change occurs, update the number of images to display
    $("input[type='radio']").on("change",function() {
        selectedNumber = parseInt($("input[type='radio']:checked").val());
    })

    // Function to get images data from Flickr API in pagination mode
    function getDataPaginationMode(atPage)
    {
        // Clear the div of images when a new research is done
        $("#showImagesPaginationMode").empty();
        $.ajax({
            type: "GET",
            dataType: "json",
            //https://www.flickr.com/services/feeds/docs/photos_public/
            url: "https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
            data: "tags=" + $("#commune").val()+"&per_page="+selectedNumber+"&page="+atPage,
            success: function(data) {
                $.each(data.photos.photo, function(i, image) {
                    // Show only the good number of images
                    if(i == selectedNumber)
                        return false;

                    // Call getImages function to delegate the responsability
                    getImagesPaginationMode(image);
                    
                })
                
            }
        });
    }
    
    // Function to get data images for the carosuel mode
    function getDataCarouselMode(atPage)
    {
        // Clear the div of images when a new research is done
        $("#showImagesCarouselMode").empty();
        $.getJSON("test/agile_carousel_data.php", function(data) {
        $(document).ready(function(){
            $("#showImagesCarouselMode").agile_carousel({
                carousel_data: data,
                carousel_outer_height: 228,
                carousel_height: 228,
                slide_height: 230,
                carousel_outer_width: 480,
                slide_width: 480,
                transition_time: 300,
                timer: 4000,
                continuous_scrolling: true,
                control_set_1: "numbered_buttons",
                no_control_set: "hover_previous_button,hover_next_button"
            });
        });
    });
    }

    // Function to show image
    function getImagesPaginationMode(image) {
        var link = "http://farm"+image.farm+".staticflickr.com/"+image.server+"/"+image.id+"_"+image.secret+"_m.jpg";
        $("#showImagesPaginationMode").append('<div class="col-lg-4 col-md-4 col-xs-4"><a href="#" class="thumbnail"><img class="img-responsive center-block" src="'+link+'" alt="Generic placeholder thumbnail"></a></div>')
    }

    // Function to get specific information about an image (ex : title, author, date, ...)
    function getImageInformation(id)
    { 
        $.ajax({
            type: "POST",
            dataType: "json",
            //https://www.flickr.com/services/feeds/docs/photos_public/
            url: "https://api.flickr.com/services/rest/?&method=flickr.photos.getInfo&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
            data: "photo_id="+id,
            success: function(data) 
            {
                // alert(data.photo, data.photo.title._content, data.photo.owner.username, data.photo.dates.posted);
                $("#detail").show();
                $("#detailTitre").text(data.photo.title._content);
                $("#detailAuteur").text(data.photo.owner.username);
                $("#detailDate").text(data.photo.dates.posted);
            }
        });
    }
});