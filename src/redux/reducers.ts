import { ILogsPayload, LogsActionTypes, INIT_LOGS_ACTION } from "./types";

const initialState: ILogsPayload = {
	isLoading: false,
	logs: []
};

export function logsReducer(state: ILogsPayload = initialState, action: LogsActionTypes): ILogsPayload {
	switch (action.type) {
		case INIT_LOGS_ACTION:
			return Object.assign({}, state, {
				isLoading: action.payload.isLoading
			});
		default:
			return state;
	}
}
