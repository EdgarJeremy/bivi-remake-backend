import bcrypt from 'bcrypt';
import d from 'dotenv';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import createModels from '../src/models';
import ModelFactoryInterface from '../src/models/typings/ModelFactoryInterface';
import { UserInstance } from '../src/models/User';

const log: (msg: string) => void = console.log;

const dotenv: string = `
# Database
DB_HOST=localhost
DB_DIALECT=postgres
DB_DATABASE=bivi
DB_USER=postgres
DB_PASS=
DB_FORCE_RENEW=false

# Request
API_URL=/api
REQUEST_LIMIT=1024mb
ALLOW_ORIGIN=*

# Token
TOKEN_SECRET=bivitokensecret221b
REFRESH_TOKEN_SECRET=bivirefreshtokensecret221b
TOKEN_EXPIRATION=1m
REFRESH_TOKEN_EXPIRATION=7d

# System
SYSTEM_LOGGING=false
NODE_ENV=development
`;

log(chalk.cyan('(postinstall) : Membuat file .env'));
if (!fs.existsSync(path.resolve(__dirname, '..', '.env'))) {
	fs.writeFileSync(path.resolve(__dirname, '..', '.env'), dotenv);
}
log(chalk.cyan('(postinstall) : File .env telah dibuat\n'));

d.config();

log(chalk.cyan('(postinstall) : Membuat user admin'));
const models: ModelFactoryInterface = createModels();
models.sequelize
	.sync({ force: true })
	.then(() => models.User.findOne({ where: { username: 'admin' } }))
	.then((u: UserInstance | null) => {
		if (!u) {
			return models.User.create({
				name: 'Administrator',
				username: 'admin',
				password: bcrypt.hashSync('admin', 10),
				type: 'administrator',
			}).then(() => {
				log(chalk.cyan('(postinstall) : User admin telah dibuat'));
				process.exit(0);
			});
		} else {
			log(chalk.cyan('(postinstall) : User admin telah dibuat'));
			process.exit(0);
		}
	});
