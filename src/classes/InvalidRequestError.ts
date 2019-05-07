import SiriusError from './SiriusError';

export default class InvalidRequestError extends SiriusError {
	name: string = 'InvalidRequestError';
	code: number = 400;
	message: string = 'InvalidRequest Error';
}
