import SiriusError from "./SiriusError";

export default class CredentialsError extends SiriusError {
    name: string = 'CredentialsError';
    code: number = 403;
    message: string = 'Credentials Error';
}