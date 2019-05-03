import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';
import { ScheduleTimeList } from '../helpers/ScheduleTime';

export interface ScheduleAttributes {
	id?: number;

	date: Date;
	open: string;
	close: string;
	processing_time: number; // in minute
	tolerance: number; // in minute
	break_start: string;
	break_end: string;
	operator: number;

	created_at?: Date;
	updated_at?: Date;
}

export interface ScheduleInstance
	extends Sequelize.Instance<ScheduleAttributes>,
		ScheduleAttributes {
			dataValues: any;
		}

export const ScheduleFactory: Factory<ScheduleInstance, ScheduleAttributes> = (
	sequelize: Sequelize.Sequelize,
	DataTypes: Sequelize.DataTypes,
): Sequelize.Model<ScheduleInstance, ScheduleAttributes> => {
	const attributes: SequelizeAttributes<ScheduleAttributes> = {
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		open: {
			type: DataTypes.TIME,
			allowNull: false,
		},
		close: {
			type: DataTypes.TIME,
			allowNull: false,
		},
		processing_time: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		tolerance: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		break_start: {
			type: DataTypes.TIME,
			allowNull: false,
		},
		break_end: {
			type: DataTypes.TIME,
			allowNull: false,
		},
		operator: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	};
	const Schedule: Sequelize.Model<ScheduleInstance, ScheduleAttributes> = sequelize.define<
		ScheduleInstance,
		ScheduleAttributes
	>('schedule', attributes, { underscored: true });

	Schedule.associate = (models: ModelFactoryInterface): void => {};

	return Schedule;
};
