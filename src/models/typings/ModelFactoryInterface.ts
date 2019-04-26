import Sequelize from 'sequelize';
import { UserInstance, UserAttributes } from '../User';
import { TokenInstance, TokenAttributes } from '../Token';
import { PurposeInstance, PurposeAttributes } from '../Purpose';
import { RequirementInstance, RequirementAttributes } from '../Requirement';
import { QueueInstance, QueueAttributes } from '../Queue';
import { DocumentInstance, DocumentAttributes } from '../Document';

interface Obj {
	[s: string]: any;
}

export default interface ModelFactoryInterface extends Obj {
	sequelize: Sequelize.Sequelize;
	Sequelize: Sequelize.SequelizeStatic;
	User: Sequelize.Model<UserInstance, UserAttributes>;
	Token: Sequelize.Model<TokenInstance, TokenAttributes>;
	Purpose: Sequelize.Model<PurposeInstance, PurposeAttributes>;
	Requirement: Sequelize.Model<RequirementInstance, RequirementAttributes>;
	Queue: Sequelize.Model<QueueInstance, QueueAttributes>;
	Document: Sequelize.Model<DocumentInstance, DocumentAttributes>;
}
