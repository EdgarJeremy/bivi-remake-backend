import express from 'express';
import { Routes } from './typings/RouteInterface';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import parser, { ParsedQuery } from '../middlewares/pipes/parser';
import a from '../middlewares/wrapper/a';
import { PaginatedResult } from './typings/QueryInterface';
import { OkResponse } from './typings/BodyBuilderInterface';
import NotFoundError from '../classes/NotFoundError';
import { RequirementInstance, RequirementAttributes } from '../models/Requirement';
import { createRequirement, editRequirement } from './requirement.validation';

const requirementsRoute: Routes = (
	app: express.Application,
	models: ModelFactoryInterface,
): express.Router => {
	const router: express.Router = express.Router();
	const { Requirement }: ModelFactoryInterface = models;

	router.get(
		'/',
		parser(),
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { limit = 10, offset = 0 }: ParsedQuery = req.parsed;

				const data: PaginatedResult<RequirementInstance> = await Requirement.findAndCountAll({
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
