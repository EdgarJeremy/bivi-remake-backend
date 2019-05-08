import express, { Request } from 'express';
import socketio from 'socket.io';
import ModelFactoryInterface from '../../models/typings/ModelFactoryInterface';
import { UserInstance } from '../../models/User';

export interface Routes {
	(app: express.Application, models: ModelFactoryInterface, io: socketio.Server): express.Router;
}

export interface A {
	(handler: express.Handler): express.Handler;
}

export interface ObjectKeyValue {
	[s: string]: any;
}
