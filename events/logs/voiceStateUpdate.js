const db = require("../../util/db.js");

module.exports = async (client, oldState, newState) => {
	// Ce gestionnaire d'événements peut être utilisé pour des logs plus avancés
	// Actuellement, il sera traité par les événements spécifiques voiceChannelJoin et voiceChannelLeave
	
	// Gestion des changements de statut de stream
	if (!oldState.streaming && newState.streaming) {
		// Le membre a commencé à diffuser
		client.emit('voiceStreamingStart', newState.member, newState.channel);
	}
	
	if (oldState.streaming && !newState.streaming) {
		// Le membre a arrêté de diffuser
		client.emit('voiceStreamingStop', newState.member, newState.channel);
	}
};
