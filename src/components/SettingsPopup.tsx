import React, { PureComponent } from 'react';
import { Dialog, DialogTitle, TextField, Button, Slider, Typography, Divider } from '@material-ui/core';

interface ISettingsPopupState {
	filePath: string;
	interval: number;
};

interface IAppDataExtract {
	filePath: string;
	interval: number;
};

interface ISettingsPopupProps {
	parentData: IAppDataExtract;
	open: boolean;
	onClose: () => void;
	applySettings: (filePath: string, interval: number) => void;
};

class SettingsPopup extends PureComponent<ISettingsPopupProps, ISettingsPopupState> {
	constructor(props: ISettingsPopupProps) {
		super(props);
		this.handleInterval = this.handleInterval.bind(this);
		this.state = {
			filePath: this.props.parentData.filePath,
			interval: this.props.parentData.interval
		};
	}

	handleInterval(value: any) {
		const numericVal: number = +value;
		let isNumeric: boolean = !isNaN(numericVal) && isFinite(numericVal);
		if (isNumeric) {
			this.setState({ interval: Math.max(1, numericVal) });
		}
	}

	applySettings() {
		this.handleInterval(this.state.interval);
		this.props.applySettings(this.state.filePath, this.state.interval);
		this.props.onClose();
	}

	render() {
		return (
			<Dialog
				aria-labelledby="settings-popup"
				open={this.props.open}
				onClose={() => this.props.onClose()}
			>
				<div
					style={{
						width: "300px",
						height: "300px",
						margin: "22px",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-around",
						alignItems: "center"
					}}
				>
					<DialogTitle id="settings-popup-title">Settings</DialogTitle>
					<TextField
						id="filepath"
						label="File path"
						variant="outlined"
						defaultValue={this.state.filePath}
						onChange={(event: any) => this.setState({ filePath: event.target.value })}
					/>
					<Divider style={{ width: "100%" }} />
					<Typography>
						Refresh rate (in s)
					</Typography>
					<Slider
						value={this.state.interval}
						aria-labelledby="slider-refresh-rate"
						valueLabelDisplay="auto"
						step={1}
						min={1}
						max={60}
						onChange={(_: any, value: any) => this.handleInterval(value)}
					/>
					<Button
						color="primary"
						variant="contained"
						onClick={() => this.applySettings()}
					>
						Save
					</Button>
				</div>
			</Dialog>
		)
	}
}

export default SettingsPopup;
