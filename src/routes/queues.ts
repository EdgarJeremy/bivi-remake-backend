import express from 'express';
import Bluebird from 'bluebird';
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
    models: ModelFactoryInterface
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
                        date: new Date()
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
                const { documents }: { documents: { name: string, data: string }[] } = req.body;

                const schedule: ScheduleInstance | null = await Schedule.findOne({
                    where: { date: new Date(date) }
                });

                if (!schedule) throw new NotFoundError('Jadwal hari belum di-set');

                const num: number = await Queue.count({
                    where: { date: new Date(date), time: time }
                });

                if (num < schedule.operator) {
                    const queue: QueueInstance = await Queue.create({
                        date, name, phone, nik, time, purpose_id, status: false
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

                    const body: OkResponse = { data: queue };
                    res.json(body);
                } else {
                    throw new InvalidRequestError('Jumlah quota pendaftaran sudah habis');
                }
            }
        )
    )

    return router;
}

export default queuesRoute;