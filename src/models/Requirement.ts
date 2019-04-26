import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';

export interface RequirementAttributes {
	id?: number;

	name: string;

	created_at?: Date;
	updated_at?: Date;
}

export interface RequirementInstance
	extends Sequelize.Instance<RequirementAttributes>,
		RequirementAttributes {}

export const RequirementFactory: Factory<RequirementInstance, RequirementAttributes> = (
	sequelize: Sequelize.Sequelize,
	DataTypes: Sequelize.DataTypes,
): Sequelize.Model<RequirementInstance, RequirementAttributes> => {
	const attributes: SequelizeAttributes<RequirementAttributes> = {
		name: {
			type: DataTypes.STRING(191),
			allowNull: false,
		},
	};
	const Requirement: Sequelize.Model<
		RequirementInstance,
		RequirementAttributes
	> = sequelize.define<RequirementInstance, RequirementAttributes>('requirement', attributes, {
		underscored: true,
	});

	Requirement.associate = (models: ModelFactoryInterface): void => {};

	return Requirement;
};
