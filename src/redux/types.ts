export const INIT_LOGS_ACTION = "INIT_LOGS_ACTION";

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
	type: typeof INIT_LOGS_ACTION,
	payload: {
		isLoading: boolean
	}
};

export type LogsActionTypes = FetchLogsAction;
