/** import modules */
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import http from 'http';
import socketio from 'socket.io';
import moment from 'moment';
import session from 'express-session';
import svgCaptcha from 'svg-captcha';
import _ from 'lodash';

import ModelFactoryInterface from './models/typings/ModelFactoryInterface';
import createModels from './models';
import createRoutes, { SiriusRouter } from './routes';
import tokenMiddleware from './middlewares/pipes/token';
import websocket from './websocket';
import { QueueInstance } from './models/Queue';

/** import .env file configuration */
dotenv.config();

/** app variables */
const app: express.Application = express();
const web: http.Server = new http.Server(app);
const io: socketio.Server = socketio(web);
const models: ModelFactoryInterface = createModels();
const allowOrigins: string | string[] = process.env.ALLOW_ORIGIN
	? process.env.ALLOW_ORIGIN === '*'
		? '*'
		: process.env.ALLOW_ORIGIN.split(',').map((origin: string) => origin.trim())
	: `http://localhost:${process.env.PORT || 1234}`;

/** setup websocket */
websocket(io);

/** middlewares */
app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '1024mb' }));
app.use(bodyParser.urlencoded({ limit: process.env.REQUEST_LIMIT || '1024mb', extended: true }));
app.use(cors({ origin: process.env.ALLOW_ORIGIN, credentials: true }));
app.use(tokenMiddleware(models)); // token auth
app.use(session({
	secret: process.env.TOKEN_SECRET || 'sirius',
	cookie: {
		maxAge: 36000000
	},
	resave: true,
	saveUninitialized: false
}));

/** router configuration */
const routes: SiriusRouter[] = createRoutes(app, models, io);
const apiURL: string = process.env.API_URL ? process.env.API_URL : '/api';
let routeData: any = {};

/** extract route data */
routes.forEach((route: SiriusRouter) => {
	const key: string = `${apiURL}/${route.basepoint}`;
	routeData[key] = { endpoints: [] };
	route.stack.forEach((info: any) => {
		let { route }: { route: any } = info;
		if (route) {
			let endpoint: string = route.path;
			let verbs: any = route.methods.get
				? 'GET'
				: route.methods.post
					? 'POST'
					: route.methods.put
						? 'PUT'
						: 'DELETE';
			let keys: any = info.keys.map((t: any) => t.name);
			routeData[key].endpoints.push({ endpoint, verbs, keys });
		}
	});
});

/** meta route for inspector */
app.get(
	'/app_meta',
	(req: express.Request, res: express.Response): void => {
		console.log(`Client Origin: ${req.get('origin')}`);
		console.log(`Client IP: ${req.socket.remoteAddress}`);
		let data: { routes: any[]; models: any[] } = { routes: [], models: [] };
		Object.keys(routeData).forEach((route: any) => {
			data.routes.push({
				basepoint: route,
				endpoints: routeData[route].endpoints,
			});
		});
		Object.keys(models).forEach((modelName: string) => {
			if (['sequelize', 'Sequelize'].indexOf(modelName) === -1) {
				data.models.push({
					name: modelName,
					basepoint: models[modelName].getTableName(),
					attributes: models[modelName].rawAttributes,
				});
			}
		});
		res.json(data);
	},
);

/** captcha */
app.get(
	'/captcha',
	(req: express.Request, res: express.Response): void => {
		const captcha: svgCaptcha.CaptchaObj = svgCaptcha.create();
		if(req.session) {
			req.session.captcha_text = captcha.text;
		}

		res.type('svg');
		res.status(200).send(captcha.data);
	}
)

/** root route */
if (process.env.NODE_ENV === 'development') {
	app.use(express.static(path.resolve(__dirname, '..', 'inspector')));
} else {
	app.use(express.static(path.resolve(__dirname, '..', 'frontend')));
}

/** sync models & start server */
models.sequelize
	.sync({
		force: process.env.DB_FORCE_RENEW === 'true',
		alter: false,
	})
	.then(
		(): void => {

			setInterval(async function (): Promise<void> {
				const t: [number, QueueInstance[]] = await models.Queue.update({
					status: 'Tidak Datang'
				}, {
						where: {
							status: 'Belum Datang',
							date: new Date(),
							time: { [models.sequelize.Op.lt]: moment().format('HH:mm:ss') }
						}
					});
				if (t[0] > 0) {
					io.emit('UPDATE_LIST');
				}
			}, 1000 * 1);

			web.listen(
				process.env.PORT || 1234,
				(): void => {
					console.log('App running');
				},
			);
		},
	);
