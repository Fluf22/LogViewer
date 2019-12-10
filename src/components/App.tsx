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

interface IAppState {
	timerID: number | null;
	filePath: string;
	interval: number;
};

class App extends PureComponent<IAppProps, IAppState> {
	constructor(props: any) {
		super(props);
		this.state = {
			timerID: null,
			filePath: "/tmp/access.log",
			interval: 10000
		};
		this.props.fetchLogs();
	}

	componentDidMount() {
		ipcRenderer.on('asynchronous-reply', (event, arg) => {
			console.log("React:", arg) // affiche "pong"
			// this.props.setLogs(arg);
		});
		ipcRenderer.send('asynchronous-message', this.state.filePath);
		const newTimerID = window.setInterval(() => {
			ipcRenderer.send('asynchronous-message', this.state.filePath);
		}, this.state.interval);
		this.setState({ timerID: newTimerID });
	}

	componentDidUpdate(prevProps: IAppProps, prevState: IAppState) {
		if (this.state.timerID &&
			(this.state.interval !== prevState.interval || this.state.filePath !== prevState.filePath)) {
			window.clearInterval(this.state.timerID);
			const newTimerID = window.setInterval(() => {
				ipcRenderer.send('asynchronous-message', this.state.filePath);
			}, this.state.interval);
			this.setState({ timerID: newTimerID });
		}
	}

	componentWillUnmount() {
		if (this.state.timerID) {
			window.clearInterval(this.state.timerID);
			this.setState({ timerID: null });
		}
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
