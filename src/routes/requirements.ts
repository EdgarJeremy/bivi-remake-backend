import express from 'express';
import { Routes } from './typings/RouteInterface';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import a from '../middlewares/wrapper/a';
import { PaginatedResult } from './typings/QueryInterface';
import { OkResponse } from './typings/BodyBuilderInterface';
import NotFoundError from '../classes/NotFoundError';
import { RequirementInstance, RequirementAttributes } from '../models/Requirement';
import { createRequirement, editRequirement } from './requirement.validation';
import { Parser } from '../helpers/Parser';
import sequelize from 'sequelize';

const requirementsRoute: Routes = (
	app: express.Application,
	models: ModelFactoryInterface,
): express.Router => {
	const router: express.Router = express.Router();
	const { Requirement }: ModelFactoryInterface = models;

	router.get(
		'/',
		Parser.validateQ(),
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const parsed: sequelize.FindOptions<RequirementInstance> = Parser.parseQuery<
					RequirementInstance
				>(req.query.q, models);
				const data: PaginatedResult<RequirementInstance> = await Requirement.findAndCountAll(
					parsed,
				);
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
				const requirement: RequirementInstance | null = await Requirement.findByPk(id);
				if (!requirement) throw new NotFoundError();
				const body: OkResponse = { data: requirement };

				res.json(body);
			},
		),
	);

	router.post(
		'/',
		createRequirement,
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { name }: RequirementAttributes = req.body;
				const requirement: RequirementInstance = await Requirement.create({
					name: name,
				});
				const body: OkResponse = { data: requirement };

				res.json(body);
			},
		),
	);

	router.put(
		'/:id',
		editRequirement,
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: { id: number } = req.params;
				const { name }: RequirementAttributes = req.body;
				const requirement: RequirementInstance | null = await Requirement.findByPk(id);
				if (!requirement) throw new NotFoundError();
				await requirement.update({ name });
				const body: OkResponse = { data: requirement };

				res.json(body);
			},
		),
	);

	router.delete(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: { id: number } = req.params;
				const requirement: RequirementInstance | null = await Requirement.findByPk(id);
				if (!requirement) throw new NotFoundError();
				await requirement.destroy();
				const body: OkResponse = { data: requirement };

				res.json(body);
			},
		),
	);

	return router;
};

export default requirementsRoute;
