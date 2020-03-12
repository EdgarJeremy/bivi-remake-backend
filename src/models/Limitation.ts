import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';

export interface LimitationAttributes {
    id?: number;

    limit: number;

    created_at?: Date;
    updated_at?: Date;

    schedule_id?: number;
    purpose_id?: number;
}

export interface LimitationInstance
    extends Sequelize.Instance<LimitationAttributes>,
    LimitationAttributes { }

export const LimitationFactory: Factory<LimitationInstance, LimitationAttributes> = (
    sequelize: Sequelize.Sequelize,
    DataTypes: Sequelize.DataTypes,
): Sequelize.Model<LimitationInstance, LimitationAttributes> => {
    const attributes: SequelizeAttributes<LimitationAttributes> = {
        limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    };
    const Limitation: Sequelize.Model<LimitationInstance, LimitationAttributes> = sequelize.define<
        LimitationInstance,
        LimitationAttributes
    >('limitation', attributes, { underscored: true });

    Limitation.associate = (models: ModelFactoryInterface): void => {
        Limitation.belongsTo(models.Schedule, { onDelete: 'cascade' });
        Limitation.belongsTo(models.Purpose, { onDelete: 'cascade' });
    };

    return Limitation;
};
