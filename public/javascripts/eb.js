/**
 * Created by Aji John on 8/18/16.
 * Supports Main Page
 */
$(function () {




    var ExtRequest = Backbone.Model.extend({

        defaults: {
            misc:"",
            email:"",
            status:"",
            aggregationmetric:"",
            lats:[],
            timelogged:"",
            longs:[],
            variable:[],
            interval:"",
            text:"",
            enddate:"",
            outputformat:"",
            startdate:""
        }
    });

    var ExtRequestCollection = Backbone.Collection.extend({
        model: ExtRequest,
        url: '/requests/' ,

        initialize: function () {
            this.fetch();
        }

    });

    var RequestsMain = Backbone.Model.extend({
        defaults: {
            url: '',
            title: ''
        }
    });

    // Create Request View
    var RequestView = Backbone.View.extend({

        tagName: 'tr',

        template: _.template($('#process-tpl').html()),

        render: function() {
            this.$el.html(this.template(this.model.attributes));
            return this;
        }

    });


    var RequestsView = Backbone.View.extend({
        el: $('#requests-main-dp'),
        events: {
            "click a#refresh": "refresh"
        },
        initialize: function () {
            var self = this;
            self.ExtRequestCollection = new ExtRequestCollection();
             // for Backbone >= 1.0
           this.ExtRequestCollection.on("sync", this.render, this);
            this.render();

        },

        requestsTemplate: _.template($('#process-tpl').html()),

        refresh: function () {
            var self = this;
            //Remove existing collection - maybe another elegant way!
            $('#requests-main-dp .well').remove();
            self.ExtRequestCollection.fetch({reset: true});
        },

        render: function () {
            var self = this;

            //TODO Preferred way - to debug
            /*
            self.ExtRequestCollection.each(function(model) {
                var requestView = new RequestView({
                    model: model
                });

                this.$el.append(requestView.render().el);
            }.bind(this));

            return this;*/

            /*
            _.each(self.ExtRequestCollection.models, function (element, index) {
                self.$el.append(self.requestsTemplate(element.attributes));
            })
            */


            //backup
            _.each(self.ExtRequestCollection.toJSON(), function (element, index) {
                //TODO - NOT WORKING for some reason, to look into it
                // self.$el.append(self.requestsTemplate(element));

                var htmla=
                    '<div class="well">'+
                    '<div class="row">'+

                    '<div class="col-xs-4">'+
                    '<button type="button" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal"> '+
                    element._id +
                    '</button> ' +
                    '</div>'+

                    '<div class="col-xs-4">'+
                    '<a  class="btn btn-default btn-lg pull-left disabled" data-placement="top"'+
                    'data-original-title=".btn .btn-default .btn-lg">'+
                    element.status+
                    '</a>'+
                    '</div>'+


                    '<div class="col-xs-4">'+
                    '<a  class="btn btn-default btn-lg pull-left disabled" data-placement="top"'+
                    'data-original-title=".btn .btn-default .btn-lg">'+
                    moment(element.timelogged).utc().format("MM/DD/YYYY HH:mm") +
                    '</a>'+
                    '</div>'+




                    '</div> '+
                    '</div>';

                self.$el.append(htmla);
            })



        }
    });
    new RequestsView();

    var MainView = Backbone.View.extend({
        el: $('#main'),

        events: {
            "click .save": "save"
        },

        alertSuccessTemplate: _.template($('#alert-success-tpl').html()),
        alertDangerTemplate: _.template($('#alert-danger-tpl').html()),

        initialize: function () {
            var self = this;
        },
        reset: function(){

        },
        save: function (e) {
            var self = this;
            self.$el.find('.alert-container').empty();
            $(".overlay").show();

            if($('#extractform').parsley().validate()) {
                self.$el.find('.alert-container').empty();

                stfmtdt = moment(self.$el.find('#stdate').val()).utc().format("YYYYMMDD");
                endfmtdt = moment(self.$el.find('#eddate').val()).utc().format("YYYYMMDD");

                var data = {
                    variable: self.$el.find('#variable').val(),
                    dateperformed: moment(new Date()).utc().format("MM/DD/YYYY HH:mm:ss Z"),

                    shadelevel:self.$el.find('input:radio[name=shadelevel]').val(),
                    hod:self.$el.find('#hod').val(),

                    //latS,latN,lonW,lonE
                    latN: self.$el.find('#latN').val(),
                    latS: self.$el.find('#latS').val(),
                    lonW: self.$el.find('#lonW').val(),
                    lonE: self.$el.find('#lonE').val(),

                    startdate: stfmtdt,
                    enddate: endfmtdt,

                    interval:self.$el.find('#interval').val(),
                    aggregation:self.$el.find('#aggregation').val(),

                    file: self.$el.find('input:radio[name=file]').val(),
                    email: self.$el.find('#email').val()
                };

                $.post('/requests/' , data, function (result) {
                    if (result.error == null) {
                        self.$el.find('.alert-container').append(self.alertSuccessTemplate());
                        $('#extractform')[0].reset();
                    } else {
                        self.$el.find('.alert-container').append(self.alertDangerTemplate());
                    }
                    $(".overlay").toggle();
                })
            }
        }
    });
    new MainView();


    var AccountView = Backbone.View.extend({
        el: $('#account'),

        events: {
            "click .apkey": "apkey"
        },


        initialize: function () {
            var self = this;
        },
        reset: function(){

        },
        apkey: function (e) {
            var self = this;

            $.get('/users/account/apikey' , data, function (result) {
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



        }
    });
    new AccountView();


    //Indicate user the avaliable time period
    $('input[name="tp"]').change( function() {
         if($(this).val()=='future')
            $("#years").text('Available time period - 2080-2099');
        else
            $("#years").text('Available time period - 1980-1999');
    })

});