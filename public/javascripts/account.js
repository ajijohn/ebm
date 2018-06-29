/**
 * Created by Aji John on 1/18/17.
 * Supports Accounts Page
 */
$(function () {


    var AccountView = Backbone.View.extend({
        el: $('#account'),

        events: {
            "click .apkey": "apkey",
            "click .apsec": "apsec",
            "click .updpro": "updpro"
        },


        initialize: function () {
            var self = this;

            //Pull and show the existing key in the database
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

            //Pull and show the existing secret in the database
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

            //Pull user account info and show
            $.get('/users/account/profile' , function (result) {
                if (result.error == null) {
                    //no error
                    //TODO show message that key was generated (flash message)
                    //self.$el.find('.alert-container').append(self.alertSuccessTemplate());
                    self.$el.find('#location').val(result.user.location)
                    self.$el.find('#university').val(result.user.university)
                    self.$el.find('#website').val(result.user.website)

                } else {
                    //error
                    //TODO show message that key was generated(flash message)
                    //self.$el.find('.alert-container').append(self.alertDangerTemplate());
                }

            })
        },
        reset: function(){

        },
        apkey: function (e) {
            var self = this;

            $.post('/users/account/apikey' , function (result) {
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

            $.post('/users/account/apisecret' , function (result) {
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
        ,
        updpro: function (e) {
            var self = this;

            var data = {
                location: self.$el.find('#location').val(),
                university: self.$el.find('#university').val(),
                website: self.$el.find('#website').val()
            };
            $.post('/users/account/profile' ,data, function (result) {
                if (result.error == null) {
                    //no error
                    //TODO show message that key was generated (flash message)
                    //self.$el.find('.alert-container').append(self.alertSuccessTemplate());
                    self.$el.find('#university').val(result.user.university)

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