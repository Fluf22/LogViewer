import { INIT_LOGS_ACTION, LogsActionTypes } from "./types";

export function fetchLogs(): LogsActionTypes {
	return {
		type: INIT_LOGS_ACTION,
		payload: {
			isLoading: true
		}
	}
}
