/**
 * Created by Aji John on 1/18/17.
 * Supports Accounts Page
 */
$(function () {


    var AccountView = Backbone.View.extend({
        el: $('#account'),

        events: {
            "click .apkey": "apkey",
            "click .apsec": "apsec"
        },


        initialize: function () {
            var self = this;
        },
        reset: function(){

        },
        apkey: function (e) {
            var self = this;

            $.get('/users/account/apikey' , function (result) {
                if (result.error == null) {
                    //no error
                    //TODO show message that key was generated (flash message)
                    //self.$el.find('.alert-container').append(self.alertSuccessTemplate());
                    self.$el.find('#apikey').val(result.apikey)

                } else {
                    //error
                    //TODO show message that key was generated(flash message)
                    //self.$el.find('.alert-container').append(self.alertDangerTemplate());
                }

            })

        },
        apsec: function (e) {
            var self = this;

            $.get('/users/account/apisecret' , function (result) {
                if (result.error == null) {
                    //no error
                    //TODO show message that key was generated (flash message)
                    //self.$el.find('.alert-container').append(self.alertSuccessTemplate());
                    self.$el.find('#apisec').val(result.apisec)

                } else {
                    //error
                    //TODO show message that key was generated(flash message)
                    //self.$el.find('.alert-container').append(self.alertDangerTemplate());
                }

            })

        }


    });
    new AccountView();


});