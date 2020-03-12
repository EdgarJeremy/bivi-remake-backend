import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';

export interface PurposeAttributes {
	id?: number;

	name: string;
	requirements: { [s: string]: any };

	created_at?: Date;
	updated_at?: Date;
}

export interface PurposeInstance extends Sequelize.Instance<PurposeAttributes>, PurposeAttributes { }

export const PurposeFactory: Factory<PurposeInstance, PurposeAttributes> = (
	sequelize: Sequelize.Sequelize,
	DataTypes: Sequelize.DataTypes,
): Sequelize.Model<PurposeInstance, PurposeAttributes> => {
	const attributes: SequelizeAttributes<PurposeAttributes> = {
		name: {
			type: DataTypes.STRING(191),
			allowNull: false,
		},
		requirements: {
			type: DataTypes.JSONB,
			allowNull: false,
		},
	};
	const Purpose: Sequelize.Model<PurposeInstance, PurposeAttributes> = sequelize.define<
		PurposeInstance,
		PurposeAttributes
	>('purpose', attributes, { underscored: true });

	Purpose.associate = (models: ModelFactoryInterface): void => {
		Purpose.hasMany(models.Queue, { onDelete: 'cascade' });
		Purpose.hasMany(models.Limitation, { onDelete: 'cascade' });
	};

	return Purpose;
};
