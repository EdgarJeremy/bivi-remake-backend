import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';

export interface DocumentAttributes {
	id?: number;

	data: string;

	created_at?: Date;
	updated_at?: Date;
}

export interface DocumentInstance
	extends Sequelize.Instance<DocumentAttributes>,
		DocumentAttributes {}

export const DocumentFactory: Factory<DocumentInstance, DocumentAttributes> = (
	sequelize: Sequelize.Sequelize,
	DataTypes: Sequelize.DataTypes,
): Sequelize.Model<DocumentInstance, DocumentAttributes> => {
	const attributes: SequelizeAttributes<DocumentAttributes> = {
		data: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	};
	const Document: Sequelize.Model<DocumentInstance, DocumentAttributes> = sequelize.define<
		DocumentInstance,
		DocumentAttributes
	>('document', attributes, { underscored: true });

	Document.associate = (models: ModelFactoryInterface): void => {
		Document.belongsTo(models.Queue, { onDelete: 'cascade' });
	};

	return Document;
};
