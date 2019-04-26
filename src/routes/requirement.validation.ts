import express from 'express';
import { checkSchema } from 'express-validator/check';
import wrapValidation from '../middlewares/validation/request';

export const createRequirement: express.Handler[] = wrapValidation(
	checkSchema({
		name: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Nama harus diisi',
				negated: true,
			},
		},
	}),
);

export const editRequirement: express.Handler[] = wrapValidation(
	checkSchema({
		name: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Nama harus diisi',
				negated: true,
			},
		},
	}),
);
