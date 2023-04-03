const { configMailTransporter } = require('../config.js');


const sendEmailNotification =async (emailDetails, notificationType) => {
    try {

        //sending Email Notification
        let details = {
            from: "manubansal.cse23@jecrc.ac.in",
            to: emailDetails.email,
            subject: emailDetails.subject,
            text: emailDetails.text
        }

        //sending mail
        // await configMailTransporter.sendMail(details);

        // console.log('email has sent');
        // return { message: 'email has sent: check your email' };

        await configMailTransporter.sendMail(details, (err) => {
            if (err) {
                console.log("it has an error", err);
                res.json({ error: err });
            }
            else {
                console.log('email has sent');
                return { message: 'email has sent: check your email' };
            }
        });

    }
    catch (error) {
        console.log('catch ' + error);
    }
}


module.exports={sendEmailNotification};