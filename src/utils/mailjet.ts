// eslint-disable-next-line @typescript-eslint/no-var-requires
const mailjet = require('node-mailjet').apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE,
  {
    config: {},
    options: {},
  },
);

type Request = {
  targetEmail: string;
  message: string;
  subject: string;
};

export const sendEmail = ({ targetEmail, subject, message }: Request) =>
  mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: 'a.abdulsatarov.b@gmail.com',
          Name: 'Giveaway company',
        },
        To: [
          {
            Email: targetEmail,
            Name: 'Receiver',
          },
        ],
        Subject: subject,
        HTMLPart: message,
      },
    ],
  });
