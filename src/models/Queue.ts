import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';

export interface QueueAttributes {
	id?: number;

	date: Date;
	name: string;
	phone: string;
	nik: string;
	status: boolean;
	time: string;
	purpose_id?: number;
	user_id?: number;

	created_at?: Date;
	updated_at?: Date;
}

export interface QueueInstance extends Sequelize.Instance<QueueAttributes>, QueueAttributes {}

export const QueueFactory: Factory<QueueInstance, QueueAttributes> = (
	sequelize: Sequelize.Sequelize,
	DataTypes: Sequelize.DataTypes,
): Sequelize.Model<QueueInstance, QueueAttributes> => {
	const attributes: SequelizeAttributes<QueueAttributes> = {
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING(191),
			allowNull: false,
		},
		phone: {
			type: DataTypes.STRING(191),
			allowNull: false,
		},
		nik: {
			type: DataTypes.STRING(191),
			allowNull: false,
		},
		status: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		time: {
			type: DataTypes.TIME,
			allowNull: false
		}
	};
	const Queue: Sequelize.Model<QueueInstance, QueueAttributes> = sequelize.define<
		QueueInstance,
		QueueAttributes
	>('queue', attributes, { underscored: true });

	Queue.associate = (models: ModelFactoryInterface): void => {
		Queue.belongsTo(models.Purpose, { onDelete: 'cascade' });
		Queue.belongsTo(models.User, { onDelete: 'cascade' });
		Queue.hasMany(models.Document);
	};

	return Queue;
};
