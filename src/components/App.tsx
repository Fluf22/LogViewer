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
		this.formatLog = this.formatLog.bind(this);
		this.state = {
			timerID: null,
			filePath: "/tmp/access.log",
			interval: 10000
		};
		this.props.fetchLogs();
	}

	formatLog(rawLog: string): ILog {
		let formattedLog: ILog;
		try {
			const [source, a, username, rawDate, rawTz, rawMethod, endpoint, b, status, size] = rawLog.split(" ");
			console.log([source, a, username, rawDate, rawTz, rawMethod, endpoint, b, status, size])
			const date = `${rawDate.replace("[", "")} ${rawTz.replace("]", "")}`;
			const method = rawMethod.replace("\"", "");
			let section = "";
			const splittedSection = endpoint.split("/");
			for (let i = 0; i < splittedSection.length - 1; ++i) {
				section += "/";
				section += splittedSection[i];
			}
			formattedLog = {
				source,
				username,
				date,
				method,
				endpoint,
				section,
				status,
				size,
				hasError: false
			};
		} catch (err) {
			formattedLog = {
				hasError: true
			};
		}
		return formattedLog;
	}

	componentDidMount() {
		ipcRenderer.on('asynchronous-reply', (event, res) => {
			if (res.err !== null) {
				console.log("Error in data: ", res.err);
			} else {
				const logStr = new TextDecoder("utf-8").decode(res.data);
				console.log("React:", logStr);
				const rawLogs = logStr.split("\n").filter(item => item !== "");
				const formattedLogs: ILog[] = [];
				for (let i = 0; i < rawLogs.length; ++i) {
					formattedLogs.push(this.formatLog(rawLogs[i]));
				}
				this.props.setLogs(formattedLogs);
			}
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
