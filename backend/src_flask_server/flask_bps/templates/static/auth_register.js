$(()=>{
    $(".btn-make-login").on("click", ()=>{
        const fData = new FormData();
        
        fData.append("username", $("input[name='username']").val());
        fData.append("password", $("input[name='password']").val());
        
        $.ajax({
            url: $("input[name='url-post-login']").val(),
            type: "POST",
            data: fData,
            contentType: false,
            processData: false,
            success: function(response) {
                if(Object.hasOwn(response, "success")){
                    $('.reg-message').html(response['message']);
                    $('.reg-message').css({color: '#28A32B'});
                    $('.reg-message').show();

                    setTimeout(()=>{
                        window.location = $("input[name='url-redirect-login']").val();
                    }, 4000);
                    
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                const rJson = jqXHR.responseJSON;
                if(Object.hasOwn(rJson, "success")){
                    if(rJson.success == false){
                        $('.reg-message').html(rJson.message);
                        $('.reg-message').css({color: '#F96D4E'});
                        $('.reg-message').show();
                    }
                }
            }
          });
    });
});