import Sequelize from 'sequelize';
import ModelFactoryInterface from './typings/ModelFactoryInterface';
import { UserFactory } from './User';
import { TokenFactory } from './Token';
import { PurposeFactory } from './Purpose';
import { RequirementFactory } from './Requirement';
import { QueueFactory } from './Queue';
import { DocumentFactory } from './Document';
import { ScheduleFactory } from './Schedule';

const createModels: Function = (): ModelFactoryInterface => {
	const {
		DB_HOST,
		DB_DIALECT,
		DB_DATABASE = 'sirius',
		DB_USER = 'sirius',
		DB_PASS = 'sirius',
	}: NodeJS.ProcessEnv = process.env;
	const sequelize: Sequelize.Sequelize = new Sequelize(DB_DATABASE, DB_USER, DB_PASS, {
		host: DB_HOST,
		dialect: DB_DIALECT,
		dialectOptions: {
			useUTC: true,
		},
		timezone: '+08:00',
		operatorsAliases: true,
		logging: console.log,
	});
	const db: ModelFactoryInterface = {
		sequelize,
		Sequelize,
		User: UserFactory(sequelize, Sequelize),
		Token: TokenFactory(sequelize, Sequelize),
		Purpose: PurposeFactory(sequelize, Sequelize),
		Requirement: RequirementFactory(sequelize, Sequelize),
		Queue: QueueFactory(sequelize, Sequelize),
		Document: DocumentFactory(sequelize, Sequelize),
		Schedule: ScheduleFactory(sequelize, Sequelize),
	};

	Object.keys(db).forEach(
		(model: string): void => {
			if (db[model].associate) {
				db[model].associate(db);
			}
		},
	);

	return db;
};

export default createModels;
