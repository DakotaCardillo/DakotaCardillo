import * as THREE from 'three';

export interface IMeshGridMaterialLineOptions {
	color?: THREE.Color;
	thickness?: number;
	offset?: number;
	cross?: number;
}

export class MeshGridMaterialLine {
	public color: THREE.Color;
	public thickness: number;
	public offset: number;
	public cross: number;

	constructor(options: IMeshGridMaterialLineOptions = {}) {
		this.color = options.color || new THREE.Color(0xffffff);
		this.thickness = options.thickness !== undefined ? options.thickness : 0.01;
		this.offset = options.offset !== undefined ? options.offset : 0.0;
		this.cross = options.cross !== undefined ? options.cross : 0.0;
	}
}
