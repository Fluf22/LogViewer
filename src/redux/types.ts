export const FETCH_LOGS_ACTION = "FETCH_LOGS_ACTION";
export const SET_LOGS_ACTION = "SET_LOGS_ACTION";

export interface ILog {
	source: string;
	username: string;
	date: string;
	method: string;
	endpoint: string;
	section: string;
	version: string;
	status: string;
	size: string;
};

export interface ILogsPayload {
	isLoading: boolean;
	logs: ILog[];
};

interface FetchLogsAction {
	type: typeof FETCH_LOGS_ACTION,
	payload: {
		isLoading: boolean
	}
};

interface SetLogsAction {
	type: typeof SET_LOGS_ACTION,
	payload: ILogsPayload
};

export type LogsActionTypes = FetchLogsAction | SetLogsAction;
