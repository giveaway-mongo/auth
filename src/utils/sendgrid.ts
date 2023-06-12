import * as sgMail from '@sendgrid/mail';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import { RpcException } from '@nestjs/microservices';

type MessageType = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

export const sendEmail = async (message: MessageType) => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send(message);
    console.log('Email is sent.');
  } catch (error) {
    console.log(error.response.body);
    throw new RpcException('Could not send email. Try again');
  }
};

export const sendBlueEmail = async () => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = 'YOUR API KEY';

  const partnerKey = defaultClient.authentications['partner-key'];
  partnerKey.apiKey = 'YOUR API KEY';

  const api = new SibApiV3Sdk.AccountApi();

  try {
    const data = await api.getAccount();
    console.log('API called successfully. Returned data: ' + data);
  } catch (error) {
    console.log(error);
    throw new RpcException('Could not send email. Try again');
  }
};
