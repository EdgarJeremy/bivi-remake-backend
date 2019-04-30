import bcrypt from 'bcrypt';
import d from 'dotenv';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import createModels from '../src/models';
import ModelFactoryInterface from '../src/models/typings/ModelFactoryInterface';
import { UserInstance } from '../src/models/User';

const log: (msg: string) => void = console.log;

d.config();

const dotenv: string = `
# Database
DB_HOST=localhost
DB_DIALECT=mysql
DB_DATABASE=
DB_USER=
DB_PASS=
DB_FORCE_RENEW=false

# Request
API_URL=/api
REQUEST_LIMIT=1024mb
ALLOW_ORIGIN=*

# Token
TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
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

log(chalk.cyan('(postinstall) : Membuat user admin'));
const models: ModelFactoryInterface = createModels();
models.sequelize
	.sync()
	.then(() =>
		models.User.create({
			name: 'Administrator',
			username: 'admin',
			password: bcrypt.hashSync('admin', 10),
			type: 'administrator',
		}),
	)
	.then((v: UserInstance) => {
		log(chalk.cyan('(postinstall) : User admin telah dibuat'));
		process.exit(0);
	});
