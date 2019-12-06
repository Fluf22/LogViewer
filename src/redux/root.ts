import { combineReducers } from 'redux';
import { ILogsPayload } from './types';
import { logsReducer } from './reducers';

export interface AppState {
	logsPayload: ILogsPayload;
};

export default combineReducers({
	logsPayload: logsReducer
});
