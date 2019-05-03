import { ScheduleInstance } from "../models/Schedule";
import ModelFactoryInterface from "../models/typings/ModelFactoryInterface";

export interface SpreadTime {
    h: number;
    m: number;
    s: number;
}

export type ScheduleTimeList = { time: string; operator_left: number }[];

export class ScheduleTime {

    public static async generateTime(schedule: ScheduleInstance, models: ModelFactoryInterface): Promise<ScheduleTimeList> {
        const date: Date = new Date(schedule.date);
        const operator: number = schedule.operator;
        const break_start: string[] = schedule.break_start.split(':');
        const bs: SpreadTime = {
            h: parseInt(break_start[0], 10),
            m: parseInt(break_start[1], 10),
            s: parseInt(break_start[2], 10)
        };
        const break_end: string[] = schedule.break_end.split(':');
        const be: SpreadTime = {
            h: parseInt(break_end[0], 10),
            m: parseInt(break_end[1], 10),
            s: parseInt(break_end[2], 10)
        }
        const start: string[] = schedule.open.split(':');
        const s: SpreadTime = {
            h: parseInt(start[0], 10),
            m: parseInt(start[1], 10),
            s: parseInt(start[2], 10)
        };
        const close: string[] = schedule.close.split(':');
        const c: SpreadTime = {
            h: parseInt(close[0], 10),
            m: parseInt(close[1], 10),
            s: parseInt(close[2], 10)
        };

        const rangeStart: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), s.h, s.m, s.s);
        const rangeEnd: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), c.h, c.m, c.s);
        const rangeBs: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), bs.h, bs.m, bs.s);
        const rangeBe: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), be.h, be.m, be.s);

        const processing_time: number = schedule.processing_time * 1;
        const tolerance: number = schedule.tolerance * 1;
        const interval: number = processing_time + tolerance;
        const list: ScheduleTimeList = [];

        while (rangeStart.toLocaleTimeString() !== rangeEnd.toLocaleTimeString()) {
            if (rangeStart.getTime() < rangeBs.getTime() || rangeStart.getTime() > rangeBe.getTime()) {
                list.push({
                    time: rangeStart.toLocaleTimeString(),
                    operator_left: operator - (await models.Queue.count({ where: { date: schedule.date, time: rangeStart.toLocaleTimeString() } }))
                });
            }
            rangeStart.setMinutes(rangeStart.getMinutes() + interval);
        }

        return list;
    }

}