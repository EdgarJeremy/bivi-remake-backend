import express from 'express';
import { Routes } from './typings/RouteInterface';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import parser, { ParsedQuery } from '../middlewares/pipes/parser';
import a from '../middlewares/wrapper/a';
import { PaginatedResult } from './typings/QueryInterface';
import { PurposeInstance, PurposeAttributes } from '../models/Purpose';
import { OkResponse } from './typings/BodyBuilderInterface';
import NotFoundError from '../classes/NotFoundError';
import { createPurpose, editPurpose } from './purposes.validation';

const purposesRoute: Routes = (
	app: express.Application,
	models: ModelFactoryInterface,
): express.Router => {
	const router: express.Router = express.Router();
	const { Purpose }: ModelFactoryInterface = models;

	router.get(
		'/',
		parser(),
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { limit = 10, offset = 0 }: ParsedQuery = req.parsed;

				const data: PaginatedResult<PurposeInstance> = await Purpose.findAndCountAll({
					limit: limit,
					offset: offset,
				});
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
