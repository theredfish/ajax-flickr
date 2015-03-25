$(document).ready(function() {
    $( "#commune" ).autocomplete({
        minLength: 3,
        source: function(request, response) {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: "http://infoweb/~jacquin-c/codePostalComplete.php",
                data: 'commune=' + $('#commune').val(),
                success: function(data) {
                    response($.map(data, function(v,i){
                        return {
                            label: v.Ville,
                            cp : v.CodePostal
                        }
                    }));
                }
            });
        },
        select: function(event,ui) {
            $("#result").text(ui.item.cp);
        }     
    }); 
});