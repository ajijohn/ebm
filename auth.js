/**
 * Created by ajijohn on 10/31/16.
 */
var ids= {
    linkedin : {
        "api_key" : "",
        "api_secret" : "",
        "callback_url" : "http://localhost:3000/auth/linkedin/callback",
        "realm":"http://localhost:3000"
    }
    ,
    twitter : {
        "api_key" : "",
        "api_secret" : "",
        "callback_url" : "http://localhost:3000/auth/twitter/callback",
        "realm":"http://localhost:3000"
    }
    ,
    google : {
        "clientID" : "",
        "clientSecret" : "",
        "callbackURL" : "http://localhost:3002/auth/google/callback",
        "realm" : "http://localhost:3002"
    }
};

module.exports=ids;