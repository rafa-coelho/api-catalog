class Mailer{
    constructor(host = process.env.MAIL_HOST, 
                port = process.env.MAIL_PORT, 
                user = process.env.MAIL_USER,
                pass = process.env.MAIL_PASS,
                from = process.env.MAIL_FROM){
        
        const nodemailer = require('nodemailer');
        this.transporter = nodemailer.createTransport({
            name: "outlook",
            host: host,
            port: port,
            secure: false,
            auth: {
                user: user,
                pass: pass
            },
            tls: { rejectUnauthorized: false }
        });

        this.from = from;
    }
    
    async Send(){
        return new Promise((resolve, reject) => {
            var obrigatorios = [ "to", "subject", "message" ];
            var errors = [];
    
            obrigatorios.forEach(campo => {
                if(!(this[campo])){
                    errors.push({
                        status: 0,
                        msg: "O campo '" + campo + "' precisa ser definido!"
                    });
                }
            });
    
            if(errors.length > 0){
                reject({
                    errors: errors,
                    status: 0
                });
                return;
            }
    
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject: this.subject,
                html: this.message
            };
            
            this.transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    resolve(error);
                } else {
                    resolve(info);
                }
            });
        })

    }

}

module.exports = Mailer;