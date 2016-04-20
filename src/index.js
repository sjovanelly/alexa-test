/**
 * App ID for the skill
 */
var APP_ID = 'aaa';

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var iMeetAPI = require('./iMeetAPI');

/**
 * iMeet is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var IMeet = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
IMeet.prototype = Object.create(AlexaSkill.prototype);
IMeet.prototype.constructor = IMeet;


IMeet.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("iMeet onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
};


IMeet.prototype.eventHandlers.onLaunch = function (launchRequest, session, voice_response) {
    console.log("iMeet onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to I Meet. How can I help you?";
    var repromptText = "How can I help you?";
    voice_response.ask(speechOutput, repromptText);
};


IMeet.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("iMeet onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
};


IMeet.prototype.intentHandlers = {
    // register custom intent handlers
    NumberAttendeesIntent: function (intent, session, voice_response) {
        authorize(intent, session, voice_response, numAttendees);
    },
    WhatAttendeesIntent: function (intent, session, voice_response) {
        authorize(intent, session, voice_response, whoInCall);
    },
    WhoAmIIntent: function (intent, session, voice_response) {
        authorize(intent, session, voice_response, whoAmI);
    },
    RunningLateIntent: function (intent, session, voice_response) {
        authorize(intent, session, voice_response, runningLate);
    },
    StartRecordIntent: function (intent, session, voice_response) {
        authorize(intent, session, voice_response, startRecording);
    },
    StopRecordIntent: function (intent, session, voice_response) {
        authorize(intent, session, voice_response, stopRecording);
    },
    MuteIntent: function (intent, session, voice_response) {
        authorize(intent, session, voice_response, muteMe);
    },
    UnmuteIntent: function (intent, session, voice_response) {
        authorize(intent, session, voice_response, unmuteMe);
    },
    HelpIntent: function (intent, session, voice_response) {
        var speechOutput = "With iMeet on Echo, you can get the number of attendees in your room or list the people in your room. " +
                           "You can also add a comment to your room, send a running late message, or start and stop a recording. " +
                           "How can I help you?";
        var repromptText = "How can I help you?";
        voice_response.ask({speech: speechOutput, type: AlexaSkill.speechOutput.PLAIN_TEXT},
                {speech: repromptText, type: AlexaSkill.speechOutput.PLAIN_TEXT});
    },
};

function authorize(intent, session, voice_response, success_callback) {
    if (session.attributes.stoken && session.attributes.realm_id) {
        console.log("User already logged in");
        success_callback(intent, session, voice_response);
    } else {
        iMeetAPI.login("aaa", "aaa",
           function(api_resp) {
                console.log("User logged in");
                console.log("login api_resp: " + JSON.stringify(api_resp));
                session.attributes.stoken = api_resp.stoken;
                session.attributes.realm_id = api_resp.realm_id;
                session.attributes.user_id = api_resp.user_id;
                session.attributes.name = api_resp.firstname + " " + api_resp.lastname;
                success_callback(intent, session, voice_response);
            },
            function(api_resp) {
              console.error("Login error: " + api_resp);
              voice_response.tell("An error occurred logging you in.");
            },
            function(api_resp) {
              console.error("Login AuthError: " + api_resp);
              voice_response.tell("An authentication error occurred logging you in.");
            }
        );
    }
}

function numAttendees(intent, session, voice_response) {
    iMeetAPI.realm_check(session.attributes.stoken, session.attributes.realm_id,
        function(realm_api_resp) {
            //console.log("realm_attendees api_resp: " + JSON.stringify(realm_api_resp));
            var user_count = (realm_api_resp.data && realm_api_resp.data.attendees) ? realm_api_resp.data.attendees.length : 0;
            if (user_count == 0) {
                voice_response.tell("Your room is empty");
            } else {
                if (user_count == 1) {
                    if (realm_api_resp.data.attendees[0].user_id == session.attributes.user_id) {
                        voice_response.tell("You are the only person in your room. Please don't be lonely!");
                    } else {
                        voice_response.tell("There is one person in your room. Why don't you join them?");
                    }
                } else {
                    voice_response.tell("There are " + user_count + " people in your room.");
                }
            }
        },
        function(api_resp) {
            console.error("numAttendees error: " + api_resp);
            voice_response.tell("An error occurred getting the number of people in your room.");
        }
    );
}

function whoInCall(intent, session, voice_response) {
    iMeetAPI.realm_check(session.attributes.stoken, session.attributes.realm_id,
        function(api_resp) {
            //console.log("realm_attendees api_resp: " + JSON.stringify(api_resp));
            var responseString = "";
            var user_count = (api_resp.data && api_resp.data.attendees) ? api_resp.data.attendees.length : 0;
            if (user_count == 0) {
                responseString = "Your room is empty right now.";
            } else {
                var attendees = api_resp.data.attendees;
                //console.log(attendees);
                if (user_count == 1) {
                    var attendee = attendees[0];
                    if (attendee.user_id == session.attributes.user_id) {
                        responseString = "You are the only person";
                    } else if (attendee.fname == "Unknown Caller") {
                        responseString = "One guest is";
                    } else {
                        responseString = attendee.fname + " " + attendee.lname + " is";
                    }
                } else {
                    var names = [];
                    var im_there = false;
                    var unknown_count = 0;
                    for (var i = 0; i < user_count; i++) {
                        var attendee = attendees[i];
                        if (attendee.user_id == session.attributes.user_id) {
                          im_there = true
                        } else if (attendee.fname == "Unknown Caller") {
                          unknown_count = unknown_count + 1;
                        } else {
                          names.push(attendee.fname + " " + attendee.lname);
                        }
                    }

                    if (unknown_count == 1) {
                      names.push("one guest");
                    } else if (unknown_count > 1) {
                      names.push(unknown_count + " guests");
                    }

                    responseString = names.join(", ");

                    if (im_there == true) {
                        responseString = responseString + " and of course, you,";
                    }

                    responseString = responseString + " are";
                }

                responseString = responseString + " in your room right now.";
            }
            voice_response.tell(responseString);
        },
        function(api_resp) {
            console.error("whoInCall error: " + api_resp);
            voice_response.tell("An error occurred getting the people in your room.");
        }
    );
}

function whoAmI(intent, session, voice_response) {
    voice_response.tell("You are " + session.attributes.name + ". Thank you for using I Meet!");
}

function runningLate(intent, session, voice_response) {
    iMeetAPI.send_room_notify(session.attributes.stoken,
        session.attributes.realm_id,
        session.attributes.user_id,
        "I'm running late. I'll be there in a few.",
        function(realm_api_resp) {
            voice_response.tell("The message was sent to your room.");
        },
        function(api_resp) {
            console.error("numAttendees error: " + api_resp);
            voice_response.tell("An error occurred sending late message.");
        }
    );
}

function startRecording(intent, session, voice_response) {
    voice_response.tell('This feature is coming soon.');
}

function stopRecording(intent, session, voice_response) {
    voice_response.tell('This feature is coming soon.');
}

function muteMe(intent, session, voice_response) {
    voice_response.tell('This feature is coming soon.');
}
function unmuteMe(intent, session, voice_response) {
    voice_response.tell('This feature is coming soon.');
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var iMeet = new IMeet();
    iMeet.execute(event, context);
};
