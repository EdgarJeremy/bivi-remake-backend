import express from 'express';
import { Routes } from './typings/RouteInterface';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import a from '../middlewares/wrapper/a';
import { PaginatedResult } from './typings/QueryInterface';
import { PurposeInstance, PurposeAttributes } from '../models/Purpose';
import { OkResponse } from './typings/BodyBuilderInterface';
import NotFoundError from '../classes/NotFoundError';
import { createPurpose, editPurpose } from './purposes.validation';
import { Parser } from '../helpers/Parser';
import sequelize from 'sequelize';

const purposesRoute: Routes = (
	app: express.Application,
	models: ModelFactoryInterface,
): express.Router => {
	const router: express.Router = express.Router();
	const { Purpose }: ModelFactoryInterface = models;

	router.get(
		'/',
		Parser.validateQ(),
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const parsed: sequelize.FindOptions<PurposeInstance> = Parser.parseQuery<
					PurposeInstance
				>(req.query.q, models);
				// @ts-ignore
				const selected_date = parsed.where ? parsed.where.selected_date : null;
				// console.log(selected_date);
				// @ts-ignore
				parsed.where && delete parsed.where.selected_date;
				const data: PaginatedResult<PurposeInstance> = await Purpose.findAndCountAll(parsed);
				for (let i = 0; i < data.rows.length; i++) {
					const total = await models.Queue.count({ where: { date: selected_date, purpose_id: data.rows[i].id! } });
					const schedule = await models.Schedule.findOne({ where: { date: selected_date }, include: [{ model: models.Limitation, include: [{ model: models.Purpose, where: { id: data.rows[i].id! } }] }] });
					if(schedule) {
						if(schedule.dataValues.limitations[0]) {
							// @ts-ignore
							data.rows[i].dataValues.quota_exceeded = total === schedule.dataValues.limitations[0].limit;
						}
					}
				}
				// @ts-ignore
				//console.log(data.rows.map(d => d.dataValues));
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
				const purpose: PurposeInstance | null = await Purpose.findByPk(id);
				if (!purpose) throw new NotFoundError();
				const body: OkResponse = { data: purpose };

				res.json(body);
			},
		),
	);

	router.post(
		'/',
		createPurpose,
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { name, requirements }: PurposeAttributes = req.body;
				const purpose: PurposeInstance = await Purpose.create({
					name: name,
					requirements: requirements,
				});
				const body: OkResponse = { data: purpose };

				res.json(body);
			},
		),
	);

	router.put(
		'/:id',
		editPurpose,
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: { id: number } = req.params;
				const { name, requirements }: PurposeAttributes = req.body;
				const purpose: PurposeInstance | null = await Purpose.findByPk(id);
				if (!purpose) throw new NotFoundError();
				await purpose.update({ name, requirements });
				const body: OkResponse = { data: purpose };

				res.json(body);
			},
		),
	);

	router.delete(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: { id: number } = req.params;
				const purpose: PurposeInstance | null = await Purpose.findByPk(id);
				if (!purpose) throw new NotFoundError();
				await purpose.destroy();
				const body: OkResponse = { data: purpose };

				res.json(body);
			},
		),
	);

	return router;
};

export default purposesRoute;
