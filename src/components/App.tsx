import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { AppState } from '../redux/root';
import { fetchLogs, setLogs } from '../redux/actions';
import { ILog } from '../redux/types';
import Header from './Header';
import '../styles/App.css';
import SettingsPopup from './SettingsPopup';
import {
	Divider,
	Typography,
	ExpansionPanel,
	ExpansionPanelSummary,
	ExpansionPanelDetails,
	Table,
	Paper,
	TableRow,
	TableHead,
	TableCell,
	TableBody,
	Snackbar,
	Button,
	IconButton,
	CircularProgress
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CloseIcon from '@material-ui/icons/Close';
import SettingsIcon from '@material-ui/icons/Settings';
import { VictoryPie } from 'victory';

interface ILogStat {
	x: string; // status or section
	y: number; // quantity
};

interface IErrorRateBySection {
	section: string;
	stats: ILogStat[];
};

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
	isSettingsPopupOpen: boolean;
	expandedPanel: string;
	isSnackbarDisplayed: boolean;
};

class App extends PureComponent<IAppProps, IAppState> {
	constructor(props: any) {
		super(props);
		this.formatLog = this.formatLog.bind(this);
		this.handleSettingsPopup = this.handleSettingsPopup.bind(this);
		this.handleState = this.handleState.bind(this);
		this.state = {
			timerID: null,
			filePath: "/tmp/access.log",
			interval: 10,
			isSettingsPopupOpen: false,
			expandedPanel: "log-stats",
			isSnackbarDisplayed: true
		};
		this.props.fetchLogs();
	}

	handleState(filePath: string, interval: number) {
		this.setState({
			filePath,
			interval
		});
	}

	handleSettingsPopup() {
		this.setState({ isSettingsPopupOpen: !this.state.isSettingsPopupOpen });
	}

	formatLog(rawLog: string): ILog {
		let formattedLog: ILog;
		try {
			const [source, a, username, rawDate, rawTz, rawMethod, endpoint, b, status, size] = rawLog.split(" ");
			const dateStr = `${rawDate.replace("[", "")} ${rawTz.replace("]", "")}`;
			const dateObj = new Date(`${dateStr.slice(0, dateStr.indexOf(":"))} ${dateStr.slice(dateStr.indexOf(":") + 1)}`);
			const date = dateObj.toUTCString();
			const method = rawMethod.replace("\"", "");
			let section = "";
			const splittedSection = endpoint.split("/");
			for (let i = 0; i < splittedSection.length - 1; ++i) {
				if (i !== 1) {
					section += "/";
				}
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
				hash: rawLog.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0).toString(),
				hasError: false
			};
		} catch (err) {
			formattedLog = {
				hash: rawLog.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0).toString(),
				hasError: true
			};
		}
		return formattedLog;
	}

	componentDidMount() {
		ipcRenderer.on('asynchronous-reply', (event, res) => {
			const formattedLogs: ILog[] = [];
			if (res.err !== null) {
				console.log("Error in data: ", res.err);
			} else {
				const logStr = new TextDecoder("utf-8").decode(res.data);
				const rawLogs = logStr.split("\n").filter(item => item !== "");
				for (let i = 0; i < rawLogs.length; ++i) {
					formattedLogs.push(this.formatLog(rawLogs[i]));
				}
			}
			this.props.setLogs(formattedLogs.reverse());
		});
		ipcRenderer.send('asynchronous-message', this.state.filePath);
		const newTimerID = window.setInterval(() => {
			ipcRenderer.send('asynchronous-message', this.state.filePath);
		}, this.state.interval * 1000);
		this.setState({ timerID: newTimerID });
	}

	componentDidUpdate(prevProps: IAppProps, prevState: IAppState) {
		if (this.state.timerID &&
			(this.state.interval !== prevState.interval || this.state.filePath !== prevState.filePath)) {
			window.clearInterval(this.state.timerID);
			const newTimerID = window.setInterval(() => {
				ipcRenderer.send('asynchronous-message', this.state.filePath);
			}, this.state.interval * 1000);
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
		if (this.props.isLoading) {
			return (
				<div className="App">
					<Header openSettings={this.handleSettingsPopup} />
					<SettingsPopup
						open={this.state.isSettingsPopupOpen}
						onClose={this.handleSettingsPopup}
						parentData={{ filePath: this.state.filePath, interval: this.state.interval }}
						applySettings={this.handleState}
					/>
					<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
						<CircularProgress />
					</div>
				</div>
			)
		} else if (this.props.logs.length === 0) {
			return (
				<div className="App">
					<Header openSettings={this.handleSettingsPopup} />
					<SettingsPopup
						open={this.state.isSettingsPopupOpen}
						onClose={this.handleSettingsPopup}
						parentData={{ filePath: this.state.filePath, interval: this.state.interval }}
						applySettings={this.handleState}
					/>
					<Snackbar
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right',
						}}
						open={this.state.isSnackbarDisplayed}
						onClose={() => this.setState({ isSnackbarDisplayed: false })}
						ContentProps={{
							'aria-describedby': 'no-data-retrieved',
						}}
						message={<span id="no-data-retrieved">Unable to retrieve data</span>}
						action={[
							<IconButton
								key="open-settings"
								aria-label="open-settings"
								color="inherit"
								onClick={() => this.setState({ isSettingsPopupOpen: !this.state.isSettingsPopupOpen })}
							>
								<SettingsIcon />
							</IconButton>,
							<IconButton
								key="close"
								aria-label="close"
								color="inherit"
								onClick={() => this.setState({ isSnackbarDisplayed: false })}
							>
								<CloseIcon />
							</IconButton>
						]}
					/>
				</div>
			)
		}
		const validLogs: ILog[] = this.props.logs.filter((log: ILog) => !log.hasError);
		let visitSectionLogStats: ILogStat[] = [];
		let errorRateBySection: IErrorRateBySection[] = [];
		for (let i = 0; i < validLogs.length; ++i) {
			let existingSection = visitSectionLogStats.map((stat: ILogStat) => stat.x);
			let logSection: string = validLogs[i].section as string;
			if (existingSection.includes(logSection)) {
				visitSectionLogStats.filter((stat: ILogStat) => stat.x === logSection)[0].y++;
			} else {
				visitSectionLogStats.push({
					x: logSection,
					y: 1
				});
				errorRateBySection.push({
					section: logSection,
					stats: []
				});
			}
			let errorRateSection = errorRateBySection.filter(item => item.section === logSection)[0];
			let existingStatus = errorRateSection.stats.map((stat: ILogStat) => stat.x);
			let logStatus: string = validLogs[i].status as string;
			if (existingStatus.includes(logStatus)) {
				errorRateSection.stats.filter((stat: ILogStat) => stat.x === logStatus)[0].y++;
			} else {
				errorRateSection.stats.push({
					x: validLogs[i].status as string,
					y: 1
				});
			}
		}
		return (
			<div className="App">
				<Header openSettings={this.handleSettingsPopup} />
				<SettingsPopup
					open={this.state.isSettingsPopupOpen}
					onClose={this.handleSettingsPopup}
					parentData={{ filePath: this.state.filePath, interval: this.state.interval }}
					applySettings={this.handleState}
				/>
				<ExpansionPanel
					expanded={this.state.expandedPanel === "log-stats"}
					onChange={() => this.setState({ expandedPanel: this.state.expandedPanel !== "log-stats" ? "log-stats" : "" })}
				>
					<ExpansionPanelSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls="log-stats-panel"
						id="log-stats-header"
					>
						<Typography>Log stats</Typography>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails>
						<div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
							<Typography><b><u>Section visits</u></b></Typography>
							<VictoryPie data={visitSectionLogStats} colorScale="heatmap" />
							<Divider style={{ width: "100%", marginBottom: "22px" }} />
							<Typography><b><u>Error rate by section</u></b></Typography>
							{
								errorRateBySection.map((item, i) => {
									return (
										<div key={item.section} style={{ marginTop: "42px", display: "flex", flexDirection: "column", alignItems: "center" }}>
											<Typography>{item.section}</Typography>
											<VictoryPie data={item.stats} colorScale="qualitative" />
											{
												i !== errorRateBySection.length - 1 ? (
													<Divider style={{ width: "100%" }} />
												) : ("")
											}
										</div>
									)
								})
							}
						</div>
					</ExpansionPanelDetails>
				</ExpansionPanel>
				<ExpansionPanel
					expanded={this.state.expandedPanel === "log-details"}
					onChange={() => this.setState({ expandedPanel: this.state.expandedPanel !== "log-details" ? "log-details" : "" })}
				>
					<ExpansionPanelSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls="log-details-panel"
						id="log-details-header"
					>
						<Typography>Log details</Typography>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails>
						<Paper>
							<Table aria-label="log-details-table">
								<TableHead>
									<TableRow>
										<TableCell>Method</TableCell>
										<TableCell align="right">Section</TableCell>
										<TableCell align="right">Endpoint</TableCell>
										<TableCell align="right">Username</TableCell>
										<TableCell align="right">Source</TableCell>
										<TableCell align="right">Status</TableCell>
										<TableCell align="right">Size</TableCell>
										<TableCell align="right">Date</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{
										validLogs.map((log: ILog) => (
											<TableRow key={log.hash}>
												<TableCell component="th" scope="row">
													{log.method}
												</TableCell>
												<TableCell align="right">{log.section}</TableCell>
												<TableCell align="right">{log.endpoint}</TableCell>
												<TableCell align="right">{log.username}</TableCell>
												<TableCell align="right">{log.source}</TableCell>
												<TableCell align="right">{log.status}</TableCell>
												<TableCell align="right">{log.size}</TableCell>
												<TableCell align="right">{log.date}</TableCell>
											</TableRow>
										))
									}
								</TableBody>
							</Table>
						</Paper>
					</ExpansionPanelDetails>
				</ExpansionPanel>
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
