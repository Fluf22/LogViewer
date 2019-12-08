import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { AppState } from '../redux/root';
import { fetchLogs, setLogs } from '../redux/actions';
import { ILog } from '../redux/types';
import { ipcRenderer } from 'electron';

interface IAppProps {
	isLoading: boolean;
	logs: ILog[];
	fetchLogs: () => {};
	setLogs: (logs: ILog[]) => {};
};

class App extends PureComponent<IAppProps> {
	constructor(props: any) {
		super(props);
		this.props.fetchLogs();
		ipcRenderer.on('asynchronous-reply', (event, arg) => {
			console.log("React:", arg) // affiche "pong"
			// this.props.setLogs(arg);
		});
	}

	componentDidMount() {
		ipcRenderer.send('asynchronous-message', 'ping');
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">Welcome to React</h1>
				</header>
				<p className="App-intro">
					To get started, edit <code>src/App.js</code> and save to reload
				</p>
			</div>
		);
	}
}

function mapStateToProps(state: AppState) {
	return {
		isLoading: state.logsPayload.isLoading,
		logs: state.logsPayload.logs
	}
}

function mapDispatchToProps(dispatch: any) {
	return {
		fetchLogs: () => dispatch(fetchLogs()),
		setLogs: (logs: ILog[]) => dispatch(setLogs(logs))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
