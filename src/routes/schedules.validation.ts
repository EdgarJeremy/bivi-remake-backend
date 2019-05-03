import express from 'express';
import { checkSchema } from 'express-validator/check';
import wrapValidation from '../middlewares/validation/request';

export const createSchedule: express.Handler[] = wrapValidation(
	checkSchema({
		date: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Tanggal harus diisi',
				negated: true,
			},
		},
		open: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Waktu buka kantor harus diisi',
				negated: true,
			},
		},
		close: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Waktu tutup kantor harus diisi',
				negated: true,
			},
		},
		processing_time: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Waktu pengerjaan harus diisi',
				negated: true,
			},
		},
		tolerance: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Waktu toleransi harus diisi',
				negated: true,
			},
		},
		break_start: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Waktu mulai istirahat harus diisi',
				negated: true,
			},
		},
		break_end: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Waktu selesai istirahat harus diisi',
				negated: true,
			},
		},
		operator: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Jumlah operator harus diisi',
				negated: true,
			},
		},
	}),
);

export const editSchedule: express.Handler[] = wrapValidation(
	checkSchema({
		date: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Tanggal harus diisi',
				negated: true,
			},
		},
		open: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Waktu buka kantor harus diisi',
				negated: true,
			},
		},
		close: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Waktu tutup kantor harus diisi',
				negated: true,
			},
		},
		tolerance: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Waktu toleransi harus diisi',
				negated: true,
			},
		},
		processing_time: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Waktu pengerjaan harus diisi',
				negated: true,
			},
		},
		break_start: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Waktu mulai istirahat harus diisi',
				negated: true,
			},
		},
		break_end: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Waktu selesai istirahat harus diisi',
				negated: true,
			},
		},
		operator: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Jumlah operator harus diisi',
				negated: true,
			},
		},
	}),
);
