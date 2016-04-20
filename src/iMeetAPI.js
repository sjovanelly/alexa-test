'use strict';

var https = require('https');

function isNullOrUndefined(element){
  var isNull = false;
  if(typeof element === "undefined" || element === null || element === "" || element === "null" || element === "undefined"){
    isNull = true;
  }
  return isNull;
}

function encodeQueryData(data)
{
  var ret = [];
  for (var d in data) {
    ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
  }

  if (ret.length > 0) {
      return "?" + ret.join("&");
  } else {
      return "";
  }
}

var iMeetCommunication = (function() {
    var iMeetBetaURL = "beta2.aaa.net",
      iMeetProdURL = "aaa.com",

      call_http = function(options) {
        var url = options.url || '',
          method = options.method || 'GET',
          data = options.data || {},
          call_success = options.success || function() {},
          call_error = options.error || function() {},
          call_noAuth = options.noAuth || function() {},
          baseUrl = (options.beta == true) ? iMeetBetaURL : iMeetProdURL;

        var request_options = {
          hostname: baseUrl,
          path: "/services/" + url + encodeQueryData(data),
          method: method
        };

        console.log("options: " + JSON.stringify(request_options));

        var req = https.request(request_options, function(res) {
            console.log('call response STATUS: ' + res.statusCode);
            //console.log('call response HEADERS: ' + JSON.stringify(res.headers));

            var body = "";

            res.on('data', function (chunk) {
                body += chunk;
            });

            res.on('end', function () {
              if (res.statusCode === 401 || res.statusCode === "error") {
                  call_noAuth(body);
              } else {
                  call_success(JSON.parse(body));
              }
            });

        });

        req.on('error', function (e) {
            console.log("call_http error: ", e.message);
            call_error(e);
        });

        req.end();
      },

      login = function(username, password, success, fail, noAuth) {
        var options = { "url": 'integration/auth',
                        "success": success,
                        "fail": fail,
                        "noAuth": noAuth,
                        "beta": (username.indexOf("/beta/")>-1),
                        "data": {"email": username.replace("/beta/",""), "password": password, "create_guest": 'y'}};
        call_http(options);
      },

      logout = function(stoken, success, fail) {
        var options = {"url": 'desktop/logout.json',
                       "success": success,
                       "fail": fail,
                       "data": {"stoken": stoken}};
        call_http(options);
      },

      realm_check = function(stoken, realm_id, success, fail) {
        var options = {"url": 'desktop/realm_attendees.json',
                       "success": success,
                       "fail": fail,
                       "data": {"stoken": stoken, "realm_id": realm_id}};
        call_http(options);
      },

      send_room_notify = function(stoken, realm_id, user_id, message, success, fail) {
        var options = {"url": 'desktop/realm_notify.json',
                       "method": "POST",
                       "success": success,
                       "fail": fail,
                       "data": {"stoken": stoken, "realm_id": realm_id, "user_id": user_id, "message": message}};
        call_http(options);
      };

    return {
        login: login,
        logout: logout,
        realm_check: realm_check,
        send_room_notify: send_room_notify
    };
})();

module.exports = iMeetCommunication;
