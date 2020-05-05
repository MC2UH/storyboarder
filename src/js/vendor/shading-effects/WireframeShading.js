
import ShadingEffect from "./ShadingEffect"
class WireframeShading extends ShadingEffect {

    constructor( renderer ){
        super(renderer);
        this.wireframeColor = new THREE.Color(0xed7014);
        this.defaultColor = new THREE.Color(0x000000);
        this.colors = {};
        this.edgesCache = {};
    }

    cleanupCache() {
        super.cleanupCache();
        let edgeMeshes = Object.values(this.edgesCache)
        for(let i = edgeMeshes.length - 1; i > -1; i--) {
            let edgeMesh = edgeMeshes[i]
            edgeMesh.geometry.dispose();
            edgeMesh.material.dispose();
            edgeMesh = null;
            delete edgeMeshes[i];
        }
    }

    setWireframe( state, scene ) {

        for(let i = 0; i < this.objects.length; i++) {
            let object = this.objects[i];
            if(state) {
                if(object.isSkinnedMesh) {
                    object.material.wireframe = state;
                    this.colors[object.uuid] = {};
                    this.colors[object.uuid].color = new THREE.Color().copy(object.material.color ? object.material.color : this.defaultColor);
                    object.material.color.copy(this.wireframeColor);
                } else  {
                    if(!this.edgesCache[object.uuid]) {
                        var edges = new THREE.EdgesGeometry( object.geometry );
                        var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: this.wireframeColor } ) );
                        line.position.copy(object.position);
                        line.quaternion.copy(object.quaternion);
                        line.scale.copy(object.scale);
                        line.updateMatrixWorld(true);
                        this.edgesCache[object.uuid] = line;
                    }
                    object.material.visible = !state;
                    object.parent.add( this.edgesCache[object.uuid] );
                }
            } else {
                if(object.isSkinnedMesh) {
                    object.material.wireframe = state;
                    object.material.color.copy(this.colors[object.uuid].color);
                    this.colors[object.uuid].color = null;
                    delete this.colors[object.uuid];
                } else {
                    object.material.visible = !state;
                    object.parent.remove( this.edgesCache[object.uuid] );
                }
            }
        }
    }

    render( scene, camera ) {
        super.render(scene, camera);
        this.setWireframe(true, scene);
        this.renderer.render(scene, camera);
        this.setWireframe(false, scene);
    }
}

export default WireframeShading;