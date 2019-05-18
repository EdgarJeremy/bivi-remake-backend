import express from 'express';
import socketio from 'socket.io';
import Bluebird from 'bluebird';
import moment from 'moment';
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
                    where: {
                        date: new Date(),
                        status: 'Belum Datang'
                    }
                });
                const body: OkResponse = { data };

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
                const { captcha }: { captcha: string } = req.body;
                const { documents }: { documents: { name: string, data: string }[] } = req.body;
                
                if(req.session) {
                    if(req.session.captcha_text !== captcha) throw new InvalidRequestError('Captcha salah');
                    req.session.captcha_text = null;
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
                        queue_number: moment(date).format('Y-MM-DD') + '_' + (numToDate + 1),
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
            async(req: express.Request, res: express.Response): Promise<void> => {
                const { id }: { id: number } = req.params;
                const data: QueueAttributes = req.body;
				const queue: QueueInstance | null = await Queue.findByPk(id);
				if (!queue) throw new NotFoundError();
                await queue.update(data);
                const body: OkResponse = { data: queue };

                if(data.called) {
                    io.emit('QUEUE_CALLED');
                }

                if(data.status === 'Datang') {
                    io.emit('QUEUE_ARRIVED');
                }

				res.json(body);
            }
        )
    )

    return router;
}

export default queuesRoute;