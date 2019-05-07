import express from 'express';
import { Routes } from './typings/RouteInterface';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import { Parser } from '../helpers/Parser';
import a from '../middlewares/wrapper/a';
import sequelize from 'sequelize';
import { PaginatedResult } from './typings/QueryInterface';
import { OkResponse } from './typings/BodyBuilderInterface';
import { ScheduleInstance, ScheduleAttributes } from '../models/Schedule';
import NotFoundError from '../classes/NotFoundError';
import { createSchedule, editSchedule } from './schedules.validation';
import { ScheduleTime, ScheduleTimeList } from '../helpers/ScheduleTime';

const schedulesRoute: Routes = (
	app: express.Application,
	models: ModelFactoryInterface,
): express.Router => {
	const router: express.Router = express.Router();
	const { Schedule }: ModelFactoryInterface = models;

	router.get(
		'/',
		Parser.validateQ(),
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const parsed: sequelize.FindOptions<ScheduleInstance> = Parser.parseQuery<
					ScheduleInstance
				>(req.query.q, models);
				const data: PaginatedResult<ScheduleInstance> = await Schedule.findAndCountAll(parsed);
				const body: OkResponse = { data };

				res.json(body);
			},
		),
	);

	router.get(
		'/:date',
		Parser.validateQ(),
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const parsed: sequelize.FindOptions<ScheduleInstance> = Parser.parseQuery<
					ScheduleInstance
				>(req.query.q, models);
				const schedule: ScheduleInstance | null = await Schedule.findOne({
					...parsed,
					where: { date: new Date(req.params.date) },
				});
				if (!schedule) throw new NotFoundError();

				const timeList: ScheduleTimeList = await ScheduleTime.generateTime(schedule, models);
				schedule.dataValues.timeList = timeList;

				const body: OkResponse = { data: schedule };
				res.json(body);
			},
		),
	);

	router.post(
		'/',
		createSchedule,
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const {
					date,
					open,
					close,
					processing_time,
					tolerance,
					break_start,
					break_end,
					operator
				}: ScheduleAttributes = req.body;
				const schedule: ScheduleInstance = await Schedule.create({
					date: date,
					open: open,
					close: close,
					processing_time: processing_time,
					tolerance: tolerance,
					break_start: break_start,
					break_end: break_end,
					operator: operator
				});
				const body: OkResponse = { data: schedule };

				res.json(body);
			},
		),
	);

	router.put(
		'/:id',
		editSchedule,
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: { id: number } = req.params;
				const {
					date,
					open,
					close,
					processing_time,
					tolerance,
					break_start,
					break_end,
					operator
				}: ScheduleAttributes = req.body;
				const schedule: ScheduleInstance | null = await Schedule.findByPk(id);
				if (!schedule) throw new NotFoundError();
				await schedule.update({ date, open, close, processing_time, tolerance, break_start, break_end, operator });
				const body: OkResponse = { data: schedule };

				res.json(body);
			},
		),
	);

	router.delete(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: { id: number } = req.params;
				const schedule: ScheduleInstance | null = await Schedule.findByPk(id);
				if (!schedule) throw new NotFoundError();
				await schedule.destroy();
				const body: OkResponse = { data: schedule };

				res.json(body);
			},
		),
	);

	return router;
};

export default schedulesRoute;
