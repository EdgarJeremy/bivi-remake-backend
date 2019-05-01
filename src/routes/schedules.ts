import express from 'express';
import { Routes } from './typings/RouteInterface';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import { Parser } from '../helpers/Parser';
import a from '../middlewares/wrapper/a';
import sequelize from 'sequelize';
import { PaginatedResult } from './typings/QueryInterface';
import { OkResponse } from './typings/BodyBuilderInterface';
import { ScheduleInstance } from '../models/Schedule';

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

	return router;
};

export default schedulesRoute;
