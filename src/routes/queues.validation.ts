import express from 'express';
import { checkSchema } from 'express-validator/check';
import wrapValidation from '../middlewares/validation/request';

export const createQueue: express.Handler[] = wrapValidation(
    checkSchema({
        date: {
            in: 'body',
            isEmpty: {
                errorMessage: 'Tanggal harus diisi',
                negated: true
            },

        },
        name: {
            in: 'body',
            isEmpty: {
                errorMessage: 'Nama harus diisi',
                negated: true
            }
        },
        phone: {
            in: 'body',
            isEmpty: {
                errorMessage: 'Nomor telefon harus diisi',
                negated: true
            }
        },
        time: {
            in: 'body',
            isEmpty: {
                errorMessage: 'Waktu harus diisi',
                negated: true
            }
        },
        documents: {
            in: 'body',
            isArray: {
                errorMessage: 'Dokumen tidak valid'
            }
        },
        'documents.*.name': {
            in: 'body',
            isEmpty: {
                negated: true,
                errorMessage: 'Nama dokumen tidak valid'
            }
        },
        'documents.*.data': {
            in: 'body',
            isEmpty: {
                negated: true,
                errorMessage: 'Data dokumen tidak valid'
            }
        },
        purpose_id: {
            in: 'body',
            isEmpty: {
                negated: true,
                errorMessage: 'Data dokumen tidak valid'
            }
        },
        token: {
            in: 'body',
            isEmpty: {
                negated: true,
                errorMessage: 'Token harus diisi'
            }
        }
    })
)