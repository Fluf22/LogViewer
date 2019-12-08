import { ILogsPayload, LogsActionTypes, FETCH_LOGS_ACTION, SET_LOGS_ACTION } from "./types";

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
					...state.logs.filter(log => action.payload.logs.includes(log)),
					...action.payload.logs.filter(log => !state.logs.includes(log))
				]
			});
		default:
			return state;
	}
}
