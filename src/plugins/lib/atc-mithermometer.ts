import { stripUndefinedProperties } from "../../lib/object-polyfill";

export interface MiContext {
	dummyData: string;
    macAddress?: number;
    temperature?: number;
	humidity?: number;
	battery?: number;
	batterymV?: number;
	sequenceNumber?: number;
}

export function parseDataFormat(data: Buffer): MiContext {

	const temperature = data.readInt16(10);
    
    const humidity = data.readUInt8(12);

    const battery = data.readUInt8(13);

	const batterymV = data.readUInt16(14);
    
    const sequenceNumber = data.readUInt8(16);

	const ret: MiContext = {
		temperature,
		humidity,
		battery,
		batterymV,
        sequenceNumber,
	};
    
	return ret;
}
