import React, { PureComponent } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';

interface IHeaderProps {
	openSettings: () => void;
};

class Header extends PureComponent<IHeaderProps> {
	render() {
		return (
			<div className="appbar">
				<AppBar position="static">
					<Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="h6" className="title">
							Foxlog
							</Typography>
						<IconButton edge="end" className="icon-button" color="inherit" aria-label="menu" onClick={() => this.props.openSettings()}>
							<SettingsIcon />
						</IconButton>
					</Toolbar>
				</AppBar>
			</div>
		)
	}
}

export default Header;
