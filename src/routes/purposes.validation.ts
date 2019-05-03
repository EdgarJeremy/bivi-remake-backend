import express from 'express';
import { checkSchema } from 'express-validator/check';
import wrapValidation from '../middlewares/validation/request';

export const createPurpose: express.Handler[] = wrapValidation(
	checkSchema({
		name: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Nama harus diisi',
				negated: true,
			},
		},
		'requirements.*.name': {
			in: 'body',
			isEmpty: {
				errorMessage: 'Nama requirement harus diisi',
				negated: true,
			},
		},
		'requirements.*.required': {
			in: 'body',
			isBoolean: {
				errorMessage: 'Pilihan opsional harus boolean',
			},
			isEmpty: {
				errorMessage: 'Pilihan opsional harus diisi',
				negated: true,
			},
		},
	}),
);

export const editPurpose: express.Handler[] = wrapValidation(
	checkSchema({
		name: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Nama harus diisi',
				negated: true,
			},
		},
		'requirements.*.name': {
			in: 'body',
			isEmpty: {
				errorMessage: 'Nama requirement harus diisi',
				negated: true,
			},
		},
		'requirements.*.required': {
			in: 'body',
			isBoolean: {
				errorMessage: 'Pilihan opsional harus boolean',
			},
			isEmpty: {
				errorMessage: 'Pilihan opsional harus diisi',
				negated: true,
			},
		},
	}),
);
