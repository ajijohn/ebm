/**
 * Created by Aji John on 8/18/16.
 * Supports Main Page
 */
$(function () {
    $("#shade label").attr("disabled", true);
    $('#hod').attr('disabled', 'disabled');


    var ExtRequest = Backbone.Model.extend({

        defaults: {
            misc: "",
            email: "",
            status: "",
            aggregationmetric: "",
            lats: [],
            timelogged: "",
            longs: [],
            variable: [],
            interval: "",
            text: "",
            enddate: "",
            outputformat: "",
            startdate: "",
            stsmsg: ""
        }
    });

    var ExtRequestCollection = Backbone.Collection.extend({
        model: ExtRequest,
        url: '/requests/',

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

        render: function () {
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
            $('#requests-main-dp #requests-main-well-item').remove();
            self.ExtRequestCollection.fetch({ reset: true });
        },

        render: function () {
            var self = this;

            _.each(self.ExtRequestCollection.toJSON(), function (element, index) {
                //TODO - NOT WORKING for some reason, to look into it
                // self.$el.append(self.requestsTemplate(element));

                var htmla =
                    '<div class="form-group row" id="requests-main-well-item">' +
                    '<div class="btn-group btn-group-toggle" >' +
                    '<div class="col-sm-12">' +
                    '<button type="button" class="btn btn-primary btn-md center-block" data-toggle="modal" ' +
                    'data-request-id="' + element._id + '" ' +
                    'data-lats-id="' + element.lats + '" ' +
                    'data-longs-id="' + element.longs + '" ' +
                    'data-variable-id="' + element.variable + '" ' +
                    'data-startdate-id="' + element.startdate + '" ' +
                    'data-enddate-id="' + element.enddate + '" ' +
                    'data-status-id="' + element.status + '" ' +
                    'data-stsmsg-id="' + element.status_message + '" ' +
                    'data-target="#myModal"> ' +
                    element._id +
                    '</button> ' +
                    '</div>' +

                    '<div class="col-xs-4">' +
                    '<a  class="btn btn-default btn-lg pull-left disabled" data-placement="top"' +
                    'data-original-title=".btn .btn-default .btn-lg">' +
                    element.status +
                    '</a>' +
                    '</div>' +


                    '<div class="col-xs-4">' +
                    '<a  class="btn btn-default btn-lg pull-left disabled" data-placement="top"' +
                    'data-original-title=".btn .btn-default .btn-lg">' +
                    moment(element.timelogged).utc().format("MM/DD/YYYY HH:mm") +
                    '</a>' +
                    '</div>' +
                    '</div>' +

                    '</div>'



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
        reset: function () {

        },
        save: function (e) {
            var self = this;
            self.$el.find('.alert-container').empty();
            $(".overlay").show();

            if ($('#extractform').parsley().validate()) {
                self.$el.find('.alert-container').empty();

                stfmtdt = moment(self.$el.find('#stdate').val()).utc().format("YYYYMMDD");
                endfmtdt = moment(self.$el.find('#eddate').val()).utc().format("YYYYMMDD");

                var data = {
                    variable: self.$el.find('#variable').val(),
                    dateperformed: moment(new Date()).utc().format("MM/DD/YYYY HH:mm:ss Z"),

                    shadelevel: self.$el.find('input:radio[name=shadelevel]').val(),
                    hod: self.$el.find('#hod').val(),

                    //latS,latN,lonW,lonE
                    latN: self.$el.find('#latN').val(),
                    latS: self.$el.find('#latS').val(),
                    lonW: self.$el.find('#lonW').val(),
                    lonE: self.$el.find('#lonE').val(),

                    startdate: stfmtdt,
                    enddate: endfmtdt,

                    interval: self.$el.find('#interval').val(),
                    aggregation: self.$el.find('#aggregation').val(),

                    file: self.$el.find('input:radio[name=file]:checked').val(),

                    email: self.$el.find('#email').val(),

                    sourcetype: self.$el.find('#sourcetype').val()
                };

                $.post('/requests/', data, function (result) {
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
        reset: function () {

        },
        apkey: function (e) {
            var self = this;

            $.get('/users/account/apikey', data, function (result) {
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

            });



        }
    });
    new AccountView();

    //Indicate user the avaliable time period
    $('input[name="tp"]').change(function () {
        if ($(this).val() == 'past') {
            $("#years").text('Available time period - 1980-1999');

            $('#eddate').datepicker('setStartDate', '01/01/1980');
            $('#eddate').datepicker('setEndDate', '12/31/1999');

            $('#stdate').datepicker('setStartDate', '01/01/1980');
            $('#stdate').datepicker('setEndDate', '12/31/1999');

            $('.datepicker').datepicker("setDate", "01/01/1980");

            $('#stdate').datepicker('update');
            $('#eddate').datepicker('update');
        }
        if ($(this).val() == 'future') {
            $("#years").text('Available time period - 2080-2099');
            $('#eddate').datepicker('setStartDate', '01/01/2080');
            $('#eddate').datepicker('setEndDate', '12/31/2099');

            $('#stdate').datepicker('setStartDate', '01/01/2080');
            $('#stdate').datepicker('setEndDate', '12/31/2099');

            $('.datepicker').datepicker("setDate", "01/01/2080");

            $('#stdate').datepicker('update');
            $('#eddate').datepicker('update');

        }
    });
   
    $('#eddate').datepicker('setStartDate', '01/01/1980');
    $('#eddate').datepicker('setEndDate', '12/31/1999');

    $('#stdate').datepicker('setStartDate', '01/01/1980');
    $('#stdate').datepicker('setEndDate', '12/31/1999');

    $('.datepicker').datepicker("setDate", "01/01/1980");

    $('#stdate').datepicker('update');
    $('#eddate').datepicker('update');
    

    //triggered when modal is about to be shown
    $('#myModal').on('show.bs.modal', function (e) {

        //get data-id attribute of the clicked element
        var requestId = $(e.relatedTarget).data('request-id');
        var latsId = $(e.relatedTarget).data('lats-id');
        var longsId = $(e.relatedTarget).data('longs-id');
        var variableId = $(e.relatedTarget).data('variable-id');
        var startdate = $(e.relatedTarget).data('startdate-id');
        var enddate = $(e.relatedTarget).data('enddate-id');
        var status = $(e.relatedTarget).data('status-id');
        var stsmsg = $(e.relatedTarget).data('stsmsg-id');

        //populate the textbox
        $(e.currentTarget).find('input[name="requestId"]').val(requestId);
        $(e.currentTarget).find('input[name="latsId"]').val(latsId);
        $(e.currentTarget).find('input[name="longsId"]').val(longsId);
        $(e.currentTarget).find('input[name="variableId"]').val(variableId);
        $(e.currentTarget).find('input[name="startdate"]').val(startdate);
        $(e.currentTarget).find('input[name="enddate"]').val(enddate);
        $(e.currentTarget).find('input[name="status"]').val(status);
        $(e.currentTarget).find('input[name="stsmsg"]').val(stsmsg);
        
    });

    //Add  events pertaining to dropdown
   $('#variable').on('hidden.bs.select', function (e) {

        var selectedVariables = $('select#variable').val()
        $('#variable').parsley().destroy();
    

        //Enable height
        if (_.contains(selectedVariables, 'SMOIS') || _.contains(selectedVariables, 'WIND10')) {
            $('#hod').removeAttr("disabled");
            $('#hod').selectpicker('refresh');
        }

        //Enable shade
        if (_.contains(selectedVariables, 'Tsurface')) {
            $("#shade label").removeAttr("disabled");
        }

        //Enable shade and height
        if (_.contains(selectedVariables, 'Tair')) {
            $('#hod').removeAttr("disabled");
            $("#shade label").removeAttr("disabled");
            $('#hod').selectpicker('refresh');
        }

        //Enable shade and depth
        if (_.contains(selectedVariables, 'Tsoil')) {
            $('#hod').removeAttr("disabled");
            $("#shade label").removeAttr("disabled");
            $('#hod').selectpicker('refresh');
        }
    });

    //Date routine checks
    $("#stdate").datepicker({
        autoclose: true,
    }).on('changeDate', function (selected) {
      var minDate = new Date(selected.date.valueOf());
    });

    $("#eddate").datepicker()
        .on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
        });
});

