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

            _.each(self.ExtRequestCollection.toJSON(), function (element, index) {
                //TODO - NOT WORKING for some reason, to look into it
               // self.$el.append(self.requestsTemplate(element.attributes));

                var htmla=
                  '<div class="well">'+
                   '<div class="row">'+
                    '<div class="col-xs-4">'+
                    '<a class="btn btn-default btn-lg pull-left" data-placement="top"'+
                    'data-original-title=".btn .btn-default .btn-lg">'  +
                        element._id +
                    '</a> '+
                    '</div>' +

                  '<div class="col-xs-4">'+
                  '<a  class="btn btn-default btn-lg pull-left disabled" data-placement="top"'+
                  'data-original-title=".btn .btn-default .btn-lg">'+
                  element.status+
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
            $(".overlay").show();

            if (self.$el.find('form').parsley('validate')  != '') {
                self.$el.find('.alert-container').empty();

                var data = {
                    variable: self.$el.find('#variable').val(),
                    dateperformed: moment(new Date()).utc().format("MM/DD/YYYY HH:mm:ss Z"),
                    lat: self.$el.find('#lat').val(),
                    lng: self.$el.find('#lng').val(),
                    startdate: self.$el.find('#stdate').val(),
                    enddate: self.$el.find('#eddate').val(),
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


});