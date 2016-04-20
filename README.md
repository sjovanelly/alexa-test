#iMeet / Amazon Alexa integration POC

## Concepts
This POC uses the Alexa Skills Kit and Amazon Lambdas to create a new Alexa Skill to integrate to your iMeet room.

## Setup
To run this skill you need to do two things. The first is to deploy the example code in lambda, and the second is to configure the Alexa skill to use Lambda.

### AWS Lambda Setup
1. Go to the AWS Console and click on the Lambda link. Note: ensure you are in us-east or you won't be able to use Alexa with Lambda.
1. Click on the Create a Lambda Function or Get Started Now button.
1. Skip the blueprint
1. Name the Lambda Function "iMeetFunctions".
1. Select the runtime as Node.js
1. Go to the src directory, select all files and then create a zip file, make sure the zip file does not contain the src directory itself, otherwise Lambda function will not work.
1. Select Code entry type as "Upload a .ZIP file" and then upload the .zip file to the Lambda
1. Keep the Handler as index.handler (this refers to the main js file in the zip).
1. Create a basic execution role and click create.
1. Leave the Advanced settings as the defaults.
1. Click "Next" and review the settings then click "Create Function"
1. Click the "Event Sources" tab and select "Add event source"
1. Set the Event Source type as Alexa Skills kit and Enable it now. Click Submit.
1. Copy the ARN from the top right to be used later in the Alexa Skill Setup

### Alexa Skill Setup
1. Go to the [Alexa Console](https://developer.amazon.com/edw/home.html) and click Add a New Skill.
1. Set "PGi iMeet" for the skill name and "history buff" as the invocation name, this is what is used to activate your skill. For example you would say: "Alexa, Ask History Buff what happened on August thirtieth."
1. Select the Lambda ARN for the skill Endpoint and paste the ARN copied from above. Click Next.
1. Copy the Intent Schema from the included IntentSchema.json.
1. Copy the Sample Utterances from the included SampleUtterances.txt. Click Next.
1. [optional] go back to the skill Information tab and copy the appId. Paste the appId into the index.js file for the variable APP_ID, then update the lambda source zip file with this change and upload to lambda again, this step makes sure the lambda function only serves request from authorized source.
1. You are now able to start testing your sample skill! You should be able to go to the [Echo webpage](http://echo.amazon.com/#skills) and see your skill enabled.
1. In order to test it, try to say some of the Sample Utterances from the Examples section below.
1. Your skill is now saved and once you are finished testing you can continue to publish your skill.

## Change credentials
For now, the credentials are hard-coded. To change them to your iMeet creds, go to line 86 in index.js to change.
## User Interactions

  User:  "Alexa, ask iMeet who I am"
  Alexa: "You are Jovi Jovanelly. Thank you for using iMeet."

  User:  "Alexa, ask iMeet how many people are in my room"
  Alexa: "Your room is empty" // if your room is empty

  User:  "Alexa, ask iMeet how many people are in my room"
  Alexa: "There are 3 people in your room." // if you have people in your room

  User:  "Alexa, ask iMeet who is in my room" 
  Alexa: "Therese Mushock, Leif Andersen, and, of course, you are in your room right now." // if you have people in your room

  User: "Alexa, tell iMeet that Im running late"
  Alexa: "The message  was sent to your room." // a message is shown to the people in your room.# alexa-test
