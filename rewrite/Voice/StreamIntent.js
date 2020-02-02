"use strict";
// represents an intent of streaming music

Object.defineProperty(exports, "__esModule", {
	value: true
});

const events = require("events");

class StreamIntent extends events.EventEmitter {
	constructor() {
		super();
	}
}
module.exports = StreamIntent;
