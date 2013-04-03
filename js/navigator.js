require(['$api/models'], function(models) {

    // When application has loaded, run pages function
    models.application.load('arguments').done(pages);

    // When arguments change, run pages function
    models.application.addEventListener('arguments', pages);

    function pages() {
        var args = models.application.arguments;
        window.location.href = "/index.html#/"+args[0];

    }

});