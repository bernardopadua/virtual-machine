export default class Dummy {
	constructor(){
		this.poolPackets = [];
	}

	static openChannel(channel){
		this.poolPackets[channel] = [];
	}

	static setMsgChannel(msg, channel){
		this.poolPackets[channel].push(msg);
	}

	static checkChannel(channel){
		if (this.poolPackets[channel] !== undefined) {
			return true;
		}

		return false;
	}

}