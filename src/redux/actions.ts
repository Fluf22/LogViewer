import { FETCH_LOGS_ACTION, LogsActionTypes, ILog, SET_LOGS_ACTION } from "./types";

export function fetchLogs(): LogsActionTypes {
	return {
		type: FETCH_LOGS_ACTION,
		payload: {
			isLoading: true
		}
	}
}

export function setLogs(logs: ILog[]): LogsActionTypes {
	return {
		type: SET_LOGS_ACTION,
		payload: {
			isLoading: false,
			logs
		}
	}
}
