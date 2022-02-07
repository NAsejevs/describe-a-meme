import React from "react";
import { Manager } from "socket.io-client";

const manager = new Manager("ws://localhost:3001", {
	autoConnect: false,
});
const socket = manager.socket("/");


class App extends React.Component {
	constructor(props: any) {
		super(props);
	}

	render() {
		return (
			<div className="App">
				Hello World!
				<button onClick={this.connect}>Connect!</button>
			</div>
		)
	}

	private connect() {
		manager.open((err) => {
			if (err) {
				console.log(err);
			} else {
				console.log("Socket is connected!");
			}
		});
	}
}

export default App;
