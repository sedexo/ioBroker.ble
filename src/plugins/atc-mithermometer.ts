/*!
 * Plugin for atc mi thermometer with custom firmware.
 * See https://github.com/atc1441/ATC_MiThermometer for details
 */

import * as nodeUrl from "url";
import { Global as _ } from "../lib/global";
import { parseDataFormat, MiContext } from "./lib/atc-mithermometer_protocol";
import { ChannelObjectDefinition, DeviceObjectDefinition, getServiceData, PeripheralObjectStructure, Plugin, StateObjectDefinition } from "./plugin";

const serviceUUID = "181a";

// remember tested peripherals by their ID for 1h
const testValidity = 1000 * 3600;
const testedPeripherals = new Map<string, { timestamp: number, result: boolean }>();

const plugin: Plugin<MiContext> = {
	name: "atc-mithermometer",
	description: "MiThermometer CFW",

	advertisedServices: [serviceUUID],

	isHandling: (peripheral: BLE.Peripheral) => {
		const cached = testedPeripherals.get(peripheral.id);
		if (cached && cached.timestamp >= Date.now() - testValidity) {
			// we have a recent test result, return it
			return cached.result;
		}
		// we have no quick check, so try to create a context
		let ret: boolean = false;
		try {
			const ctx = plugin.createContext(peripheral);
			ret = ctx != null;
		} catch (e) { /* all good */ }
		// store the test result
		testedPeripherals.set(peripheral.id, {
			timestamp: Date.now(),
			result: ret,
		});
		return ret;
	},

	createContext: (peripheral: BLE.Peripheral) => {
		if (!peripheral.advertisement) return;
		let data = getServiceData(peripheral, serviceUUID);
		if (data != undefined) {
			const url = data.toString("utf8");
			_.log(`atc-mithermometer >> got url: ${data.toString("utf8")}`, "debug");
			// data format 2 or 4 - extract from URL hash
			const parsedUrl = nodeUrl.parse(url);
			if (!parsedUrl.hash) return;
			data = Buffer.from(parsedUrl.hash, "base64");
			return parseDataFormat(data);
		}
	},

	defineObjects: (context) => {

		if (context == undefined) return;

		const deviceObject: DeviceObjectDefinition = { // no special definitions neccessary
			common: {
				name: "MiThermometer CFW"
			},
			native: undefined,
		};

		// no channels

		const stateObjects: StateObjectDefinition[] = [];

		const ret = {
			device: deviceObject,
			channels: undefined,
			states: stateObjects,
		};

		if ("temperature" in context) {
			stateObjects.push({
				id: "temperature",
				common: {
					role: "value",
					name: "Temperature",
					type: "number",
					unit: "°C",
					read: true,
					write: false,
				},
				native: undefined,
			});
		}
		if ("humidity" in context) {
			stateObjects.push({
				id: "humidity",
				common: {
					role: "value",
					name: "Relative Humidity",
					type: "number",
					unit: "%rF",
					read: true,
					write: false,
				},
				native: undefined,
			});
		}
        if ("battery" in context) {
			stateObjects.push({
				id: "batterymV",
				common: {
					role: "value",
					name: "Battery",
					desc: "Battery voltage",
					type: "number",
					unit: "mV",
					read: true,
					write: false,
				},
				native: undefined,
			});
		}
		if ("battery" in context) {
			stateObjects.push({
				id: "battery",
				common: {
					role: "value",
					name: "Battery",
					desc: "Battery voltage",
					type: "number",
					unit: "%",
					read: true,
					write: false,
				},
				native: undefined,
			});
		}

		return ret;

	},
	getValues: (context) => {
		if (context == null) return;

		// strip out unnecessary properties
		const { dummyData, macAddress, sequenceNumber, ...remainder } = context;
        
		return ret;
	},
};

export = plugin as Plugin;
