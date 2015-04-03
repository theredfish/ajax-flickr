var page = 1;

$(document).ready(function() {
    

    $( "#submit-photos" ).on("click", function() {
        // Clear the div of images when a new research is done
        page = 1;
        $("#showImages").empty()

        // Ajax request
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
            data: "tags=" + $("#commune").val()+"&per_page="+getSize(),
            success: function(data) {
                $.each(data.photos.photo, function(i, item) {
                    // Show only the good number of images
                    if(i == selectedNumber)
                        return false;
                    // Call getImages function to delegate the responsability
                    getImages(item);
                    
                })
            }
        });

    });

    $("#precedent").on("click", function(){
        precedent();
    });

    $("#suivant").on("click", function(){
        suivant();
    });
});

    function suivant()
    {
        page++;
        changement();
    }

    function precedent()
    {
        page--;
        changement();
    }

    function changement()
    {
        $("#showImages").empty();
        
        $.ajax({
            type: "GET",
            dataType: "json",
            //https://www.flickr.com/services/feeds/docs/photos_public/
            url: "https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=0ec1c8867eeca73bca63ed9b7365ad5b&format=json&jsoncallback=?",
            data: "tags=" + $("#commune").val()+"&per_page="+getSize()+"&page="+page,
            success: function(data) {
                $.each(data.photos.photo, function(i, item) {
                    // Show only the good number of images
                    if(i == selectedNumber)
                        return false;

                    // Call getImages function to delegate the responsability
                    getImages(item);
                    
                })
                
            }
        });
    }

    function popImage(image)
    {
        $(".popFont")[0].style.display="block";
        /*image.style.width="1000px";
        image.style.height="auto";*/
    }
	
	function detail(id)
	{ 
        $.ajax({
            type: "GET",
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

    	/*'<div class="col-lg-12 col-md-12 col-xs-10">Titre :' + titre + '</div><div class="col-lg-12 col-md-12 col-xs-10">Date :' + date + '</div><div class="col-lg-12 col-md-12 col-xs-10">Auteur :' + auteur + '</div>'*/
	}

    // Get images from research
    function getImages(item) {
        var link = "http://farm"+item.farm+".staticflickr.com/"+item.server+"/"+item.id+"_"+item.secret+"_m.jpg";
        $("#showImages").append('<div class="col-lg-4 col-md-4 col-xs-4"><a href="#" onmouseover="detail('+item.id+')" class="thumbnail"><img onClick="popImage(this)" class="img-responsive center-block" src="'+link+'" alt="Generic placeholder thumbnail"></a></div>')
    }

    // Get the number of images to show
    var selectedNumber = parseInt($("input[type='radio']:checked").val());

    $("input[type='radio']").on("change",function() {
        selectedNumber = parseInt($("input[type='radio']:checked").val());
    })

    function getSize()
    {
        selectedNumber = parseInt($("input[type='radio']:checked").val());
        return selectedNumber;
    }