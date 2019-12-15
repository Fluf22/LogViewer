import { ILog, ILogsPayload, LogsActionTypes, FETCH_LOGS_ACTION, SET_LOGS_ACTION } from "./types";

const initialState: ILogsPayload = {
	isLoading: false,
	logs: []
};

export function logsReducer(state: ILogsPayload = initialState, action: LogsActionTypes): ILogsPayload {
	switch (action.type) {
		case FETCH_LOGS_ACTION:
			return Object.assign({}, state, {
				isLoading: action.payload.isLoading
			});
		case SET_LOGS_ACTION:
			return Object.assign({}, state, {
				isLoading: action.payload.isLoading,
				logs: [
					...state.logs.filter((stateLog: ILog) => action.payload.logs.map((payloadLog: ILog) => payloadLog.hash).includes(stateLog.hash)),
					...action.payload.logs.filter((payloadLog: ILog) => !state.logs.map((stateLog: ILog) => stateLog.hash).includes(payloadLog.hash))
				]
			});
		default:
			return state;
	}
}
