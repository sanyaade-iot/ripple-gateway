var AmazonSES = require('amazon-ses');
var ses = new AmazonSES('AKIAJX2T3RL4BH2COYJQ', 'RBcdyrlXeyCMI5cYrB0dcJhrSB6fGR37mWecdqSi');
//ses.verifyEmailAddress('abiy@ripple.com');

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

