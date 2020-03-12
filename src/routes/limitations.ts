import express from 'express';
import { Routes } from './typings/RouteInterface';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import a from '../middlewares/wrapper/a';
import { PaginatedResult } from './typings/QueryInterface';
import { LimitationInstance, LimitationAttributes } from '../models/Limitation';
import { OkResponse } from './typings/BodyBuilderInterface';
import NotFoundError from '../classes/NotFoundError';
import { Parser } from '../helpers/Parser';
import sequelize from 'sequelize';

const limitationsRoute: Routes = (
	app: express.Application,
	models: ModelFactoryInterface,
): express.Router => {
	const router: express.Router = express.Router();
	const { Limitation }: ModelFactoryInterface = models;

	router.get(
		'/',
		Parser.validateQ(),
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const parsed: sequelize.FindOptions<LimitationInstance> = Parser.parseQuery<
					LimitationInstance
				>(req.query.q, models);
				const data: PaginatedResult<LimitationInstance> = await Limitation.findAndCountAll(parsed);
				const body: OkResponse = { data };

				res.json(body);
			},
		),
    );

	router.get(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: { id: number } = req.params;
				const limitation: LimitationInstance | null = await Limitation.findByPk(id);
				if (!limitation) throw new NotFoundError();
				const body: OkResponse = { data: limitation };

				res.json(body);
			},
		),
	);

	router.post(
		'/',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const data: LimitationAttributes = req.body;
				const limitation: LimitationInstance = await Limitation.create(data);
				const body: OkResponse = { data: limitation };

				res.json(body);
			},
		),
	);

	return router;
};

export default limitationsRoute;
