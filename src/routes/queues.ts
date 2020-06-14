import express from 'express';
import socketio from 'socket.io';
import Bluebird from 'bluebird';
import moment from 'moment';
import fetch from 'isomorphic-fetch';
import { Routes } from "./typings/RouteInterface";
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import { createQueue } from './queues.validation';
import a from '../middlewares/wrapper/a';
import { QueueAttributes, QueueInstance } from '../models/Queue';
import { DocumentInstance } from '../models/Document';
import { OkResponse } from './typings/BodyBuilderInterface';
import { ScheduleInstance } from '../models/Schedule';
import NotFoundError from '../classes/NotFoundError';
import InvalidRequestError from '../classes/InvalidRequestError';
import { Parser } from '../helpers/Parser';
import sequelize = require('sequelize');
import { PaginatedResult } from './typings/QueryInterface';

const queuesRoute: Routes = (
    app: express.Application,
    models: ModelFactoryInterface,
    io: socketio.Server
): express.Router => {
    const router: express.Router = express.Router();
    const { Queue, Document, Schedule }: ModelFactoryInterface = models;

    router.get(
        '/',
        Parser.validateQ(),
        a(
            async (req: express.Request, res: express.Response): Promise<void> => {
                const parsed: sequelize.FindOptions<QueueInstance> = Parser.parseQuery<
                    QueueInstance
                >(req.query.q, models);

                const data: PaginatedResult<QueueInstance> = await Queue.findAndCountAll({
                    ...parsed,
                });
                const body: OkResponse = { data };

                res.json(body);
            }
        )
    )

    router.get(
        '/:id',
        Parser.validateQ(),
        a(
            async (req: express.Request, res: express.Response): Promise<void> => {
                const { id }: { id: number } = req.params;
                const parsed: sequelize.FindOptions<QueueInstance> = Parser.parseQuery<
                    QueueInstance
                >(req.query.q, models);
                const queue: QueueInstance | null = await Queue.findByPk(id, parsed);
                if (!queue) throw new NotFoundError('Antrian tidak ditemukan');
                const body: OkResponse = { data: queue };

                res.json(body);
            }
        )
    )

    router.post(
        '/',
        createQueue,
        a(
            async (req: express.Request, res: express.Response): Promise<void> => {
                const { date, name, phone, nik, time, purpose_id }: QueueAttributes = req.body;
                // const { captcha }: { captcha: string } = req.body;
                const { documents }: { documents: { name: string, data: string }[] } = req.body;

                // if(req.session) {
                //     if(req.session.captcha_text !== captcha) throw new InvalidRequestError('Captcha salah');
                //     req.session.captcha_text = null;
                // }
                console.log('before captcha');
                const recaptcha_secret: string = `${process.env.RECAPTCHA_SECRET}`;
                const recaptcha_token: string = req.body.token;
                const url: string = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptcha_secret}&response=${recaptcha_token}`;
                const recaptcha_response = await fetch(url, { method: 'POST' });
                const recaptcha_data = await recaptcha_response.json();
                console.log('after captcha', recaptcha_data);
                if(!recaptcha_data.success) {
                    throw new Error(JSON.stringify(recaptcha_data['error-codes']));
                }

                const schedule: ScheduleInstance | null = await Schedule.findOne({
                    where: { date: new Date(date) }
                });

                if (!schedule) throw new NotFoundError('Jadwal hari belum di-set');

                const num: number = await Queue.count({
                    where: { date: new Date(date), time: time }
                });
                const numToDate: number = await Queue.count({
                    where: { date: new Date(date) }
                })
                if (num < schedule.operator) {
                    const queue: QueueInstance = await Queue.create({
                        queue_number: parseInt(`${moment(date).format('YYMMDD')}${(numToDate + 1)}`),
                        date, name, phone, nik, time, purpose_id,
                        status: 'Belum Datang',
                        called: 0
                    });
                    const p: Bluebird<DocumentInstance>[] = [];

                    documents.forEach((d: { name: string, data: string }): void => {
                        p.push(
                            Document.create({
                                name: d.name,
                                data: d.data,
                                queue_id: queue.id || 0
                            })
                        )
                    });

                    const r: DocumentInstance[] = await Bluebird.all(p);

                    io.emit('NEW_QUEUE');

                    const body: OkResponse = { data: queue };
                    res.json(body);
                } else {
                    throw new InvalidRequestError('Jumlah quota pendaftaran sudah habis');
                }
            }
        )
    )

    router.put(
        '/:id',
        a(
            async (req: express.Request, res: express.Response): Promise<void> => {
                const { id }: { id: number } = req.params;
                const data: QueueAttributes = req.body;
                const queue: QueueInstance | null = await Queue.findByPk(id);
                if (!queue) throw new NotFoundError();
                await queue.update(data);
                const body: OkResponse = { data: queue };

                if (data.called >= 0) {
                    io.emit('QUEUE_CALLED');
                }

                if (data.status === 'Datang' || data.status === 'Tidak Datang') {
                    io.emit('QUEUE_ARRIVED');
                }

                res.json(body);
            }
        )
    )

    router.delete(
        '/:id',
        a(
            async (req: express.Request, res: express.Response): Promise<void> => {
                const { id }: { id: number } = req.params;
                const queue: QueueInstance | null = await Queue.findByPk(id);
                if (!queue) throw new NotFoundError('Antrian tidak ditemukan');
                await queue.destroy();
                const body: OkResponse = { data: queue };

                res.json(body);
            }
        )
    )

    return router;
}

export default queuesRoute;
