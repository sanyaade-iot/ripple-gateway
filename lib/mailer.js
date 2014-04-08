var AmazonSES = require('amazon-ses');

function sendEmail(message){
    ses.send({
        from: 'abiy@ripple.com'
        , to: message.to
        , subject: message.subject
        , body: {
            text: message.body
            , html: message.body
        }
    });
}

module.exports = sendEmail;

