/**
 * Created by ajijohn on 10/31/16.
 */
var ids= {
    linkedin : {
        "api_key" : "86p869d4g6cf22",
        "api_secret" : "EW8RJQQyGXzQoivr",
        "callback_url" : "http://localhost:3002/auth/linkedin/callback",
        "realm":"http://localhost:3002"
    }
    ,
    twitter : {
        "api_key" : "oRi4Po8ySTqwPxeFs7l82j6Fi",
        "api_secret" : "cS3Wy4Gfwi7JQmXpRxn716HPBsrYobLBskLtJV7cFSwDNoYMr2",
        "callback_url" : "http://localhost:3002/auth/twitter/callback",
        "realm":"http://localhost:3002"
    }
    ,
    google : {
        "clientID" : "682101308611-0q27elros0gj225jt59vd58f22a6f78p.apps.googleusercontent.com",
        "clientSecret" : "2jkAEFMMvpiLivfMvZAim-Lk",
        "callbackURL" : "http://localhost:3002/auth/google/callback",
        "realm" : "http://localhost:3002"
    }
};

module.exports=ids;