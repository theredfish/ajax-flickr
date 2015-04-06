$(document).ready(function() {
    $( "#commune" ).autocomplete({
        minLength: 3,
        source: function(request, response) {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "http://infoweb-ens/~jacquin-c/codePostal/commune.php",
                data: 'commune=' + $('#commune').val() + '&maxRows=10',
                success: function(data) {
                    response($.map(data, function(v,i){
                        return {
                            label: v.Ville
                        }
                    }));
                }
            });
        }    
    }); 
});